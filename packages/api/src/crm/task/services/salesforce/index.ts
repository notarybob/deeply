import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { ITaskService } from '@crm/task/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
  SalesforceTaskInput,
  SalesforceTaskOutput,
  commonTaskSalesforceProperties,
} from './types';

@Injectable()
export class SalesforceService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async addTask(
    taskData: SalesforceTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SalesforceTaskOutput>> {
    try {
      var connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'salesforce',
          vertical: 'crm',
        },
      });

      var instanceUrl = connection.account_url;
      var resp = await axios.post(
        `${instanceUrl}/services/data/v56.0/sobjects/Task/`,
        JSON.stringify(taskData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      // Fetch the created task to get all details
      var taskId = resp.data.id;
      var final_resp = await axios.get(
        `${instanceUrl}/services/data/v56.0/sobjects/Task/${taskId}`,
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
        message: 'Salesforce task created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceTaskOutput[]>> {
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

      var commonPropertyNames = Object.keys(commonTaskSalesforceProperties);
      var allProperties = [...commonPropertyNames, ...custom_properties];
      var fields = allProperties.join(',');

      var query = `SELECT ${fields} FROM Task ${pagingString}`;

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

      this.logger.log(`Synced Salesforce tasks!`);

      return {
        data: resp.data.records,
        message: 'Salesforce tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}