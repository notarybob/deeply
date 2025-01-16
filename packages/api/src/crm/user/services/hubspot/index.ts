import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IUserService } from '@crm/user/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { HubspotUserOutput, commonUserHubspotProperties } from './types';

@Injectable()
export class HubspotService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.user.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<HubspotUserOutput[]>> {
    try {
      let { linkedUserId, custom_properties } = data;

      let connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      let commonPropertyNames = Object.keys(commonUserHubspotProperties);
      let allProperties = [...commonPropertyNames, ...custom_properties];
      let baseURL = `${connection.account_url}/crm/v3/owners`;

      /*let queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');*/

      //let url = `${baseURL}?${queryString}`;

      let resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      this.logger.log(`Synced hubspot users !`);

      return {
        data: resp.data.results,
        message: 'Hubspot users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
