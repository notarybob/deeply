import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ITicketService } from '@ticketing/ticket/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { JiraTicketInput, JiraTicketOutput } from './types';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class JiraService implements ITicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.ticket.toUpperCase() + ':' + JiraService.name,
    );
    this.registry.registerService('jira', this);
  }

  async addTicket(
    ticketData: JiraTicketInput,
    linkedUserId: string,
  ): Promise<ApiResponse<JiraTicketOutput>> {
    try {
      var connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });

      //first check if issueType is the right one

      var a = await axios.get(
        `${connection.account_url}/3/issuetype/project?projectId=${ticketData.fields.project.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      var item = a.data.find(
        (element) =>
          element.untranslatedName === ticketData.fields.issuetype.name,
      );

      if (item && item.id) {
        ticketData.fields.issuetype = {
          id: item.id,
        };
      } else {
        //insert the issuetype
        var resp = await axios.post(
          `${connection.account_url}/3/issuetype`,
          JSON.stringify({
            description: ticketData.fields.issuetype.name,
            name: ticketData.fields.issuetype.name,
            type: 'standard',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
        ticketData.fields.issuetype = {
          id: resp.data.id,
        };
      }
      ticketData.fields.project = {
        key: ticketData.fields.project.key,
      };

      //now handle priority
      /*var c = await axios.get(`${connection.account_url}/priority`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      var priority_ = c.data.find(
        (element) => element.name === ticketData.fields.priority.name,
      );
      var { priority, ...baseFields } = ticketData.fields;
      if (priority_) {
        ticketData.fields.priority = {
          id: priority.id,
        };
      } else {
        //create priority
        /*var resp = await axios.post(
          `${connection.account_url}/priority`,
          JSON.stringify({
            name: ticketData.fields.priority.name,
            statusColor: '#000000',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
        ticketData.fields = {
          ...baseFields,
        };
      }*/
      var { comment, ...baseFields } = ticketData.fields;

      ticketData = {
        fields: {
          ...baseFields,
        },
      };
      var resp = await axios.post(
        `${connection.account_url}/3/issue`,
        JSON.stringify(ticketData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      if (comment && comment[0]) {
        // Add comment if someone wants to add one when creation of the ticket
        var resp_comment = await axios.post(
          `${connection.account_url}/3/issue/${resp.data.id}/comment`,
          JSON.stringify(comment[0]),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
      }

      // Process attachments
      let uploads = [];
      var uuids = ticketData.attachments;
      if (uuids && uuids.length > 0) {
        uploads = await Promise.all(
          uuids.map(async (uuid) => {
            var attachment = await this.prisma.tcg_attachments.findUnique({
              where: {
                id_tcg_attachment: uuid,
              },
            });
            if (!attachment) {
              throw new ReferenceError(
                `tcg_attachment not found for uuid ${uuid}`,
              );
            }
            // TODO: Construct the right binary attachment
            // Get the AWS S3 right file
            // TODO: Check how to send a stream of a URL
            return attachment.file_url; //await this.utils.fetchFileStreamFromURL(attachment.file_url);
          }),
        );
      }

      if (uploads.length > 0) {
        var formData = new FormData();

        uploads.forEach((fileStream, index) => {
          var stats = fs.statSync(fileStream);
          var fileSizeInBytes = stats.size;
          formData.append('file', fileStream, { knownLength: fileSizeInBytes });
        });

        // Send request with attachments
        var resp_ = await axios.post(
          `${connection.account_url}/3/issue/${resp.data.id}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Atlassian-Token': 'no-check',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
      }

      var final_res = await axios.get(resp.data.self, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: final_res.data,
        message: 'Jira ticket created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<JiraTicketOutput[]>> {
    try {
      var { linkedUserId } = data;

      var connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });
      var resp = await axios.get(`${connection.account_url}/3/search`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced jira tickets !`);

      return {
        data: resp.data.issues,
        message: 'Jira tickets retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
