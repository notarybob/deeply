import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IDealService } from '@crm/deal/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
  HubspotDealInput,
  HubspotDealOutput,
  commonDealHubspotProperties,
} from './types';
@Injectable()
export class HubspotService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addDeal(
    dealData: HubspotDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotDealOutput>> {
    try {
      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      let dataBody = {
        properties: dealData,
      };
      let resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/deals`,
        JSON.stringify(dataBody),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Synced hubspot deals !`);

      return {
        data: resp.data,
        message: 'Hubspot deal created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<HubspotDealOutput[]>> {
    try {
      let { linkedUserId, custom_properties } = data;

      //crm.schemas.deals.read","crm.objects.deals.read
      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      let commonPropertyNames = Object.keys(commonDealHubspotProperties);
      let allProperties = [...commonPropertyNames, ...custom_properties];
      let baseURL = `${connection.account_url}/crm/v3/objects/deals`;

      let queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      let url = `${baseURL}?${queryString}`;

      let resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot deals !`);

      return {
        data: resp.data.results,
        message: 'Hubspot deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
