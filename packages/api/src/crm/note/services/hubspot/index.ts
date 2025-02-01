import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { INoteService } from '@crm/note/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
  HubspotNoteInput,
  HubspotNoteOutput,
  commonNoteHubspotProperties,
} from './types';

@Injectable()
export class HubspotService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addNote(
    noteData: HubspotNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotNoteOutput>> {
    try {
      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      let resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/notes`,
        JSON.stringify(noteData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      let final_resp = await axios.get(
        `${connection.account_url}/crm/v3/objects/notes/${resp.data.id}?properties=hs_note_body&associations=deal,contact,company`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: final_resp.data,
        message: 'Hubspot note created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<HubspotNoteOutput[]>> {
    try {
      let { linkedUserId, custom_properties } = data;

      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      let commonPropertyNames = Object.keys(commonNoteHubspotProperties);
      let allProperties = [...commonPropertyNames, ...custom_properties];
      let baseURL = `${connection.account_url}/crm/v3/objects/notes`;

      let queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      let url = `${baseURL}?${queryString}&associations=deal,contact,company`;

      let resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot notes !`);

      return {
        data: resp.data.results,
        message: 'Hubspot notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
