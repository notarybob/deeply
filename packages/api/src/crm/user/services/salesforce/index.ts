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
import { SalesforceUserOutput, commonUserSalesforceProperties } from './types';

@Injectable()
export class SalesforceService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.user.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceUserOutput[]>> {
    try {
      var { linkedUserId, custom_properties, pageSize, cursor } = data;

      var connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'salesforce',
          vertical: 'crm',
        },
      });

      var instanceUrl = connection.account_url;
      let pagingString = `${pageSize ? `ORDER BY Id DESC LIMIT ${pageSize} ` : ''}${
        cursor ? `OFFSET ${cursor}` : ''
      }`;
      if (!pageSize && !cursor) {
        pagingString = 'LIMIT 200';
      }

      var commonPropertyNames = Object.keys(commonUserSalesforceProperties);
      var allProperties = [...commonPropertyNames, ...custom_properties];
      var fields = allProperties.join(',');

      var query = `SELECT ${fields} FROM User ${pagingString}`;

      var resp = await axios.get(
        `${instanceUrl}/services/data/v56.0/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Synced Salesforce users!`);

      return {
        data: resp.data.records,
        message: 'Salesforce users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}