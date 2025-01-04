import { Injectable } from '@nestjs/common';
import { ICompanyService } from '@crm/company/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import {
  commonCompanyHubspotProperties,
  HubspotCompanyInput,
  HubspotCompanyOutput,
} from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class HubspotService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addCompany(
    companyData: HubspotCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotCompanyOutput>> {
    try {
      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      let dataBody = {
        properties: companyData,
      };
      let resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/companies`,
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
      return {
        data: resp.data,
        message: 'Hubspot company created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<HubspotCompanyOutput[]>> {
    try {
      let { linkedUserId, custom_properties } = data;
      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      let commonPropertyNames = Object.keys(commonCompanyHubspotProperties);
      let allProperties = [...commonPropertyNames, ...custom_properties];
      let baseURL = `${connection.account_url}/crm/v3/objects/companies`;
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
      this.logger.log(`Synced hubspot companies !`);

      return {
        data: resp.data.results,
        message: 'Hubspot companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
