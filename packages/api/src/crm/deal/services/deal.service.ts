import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject } from '@crm/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IDealService } from '../types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class DealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(DealService.name);
  }

  async addDeal(
    unifiedDealData: UnifiedCrmDealInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmDealOutput> {
    try {
      var linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateStageId(unifiedDealData.stage_id);
      await this.validateUserId(unifiedDealData.user_id);

      var desunifiedObject =
        await this.coreUnification.desunify<UnifiedCrmDealInput>({
          sourceObject: unifiedDealData,
          targetType: CrmObject.deal,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: [],
        });

      var service: IDealService =
        this.serviceRegistry.getService(integrationId);
      var resp: ApiResponse<OriginalDealOutput> = await service.addDeal(
        desunifiedObject,
        linkedUserId,
      );

      var unifiedObject = (await this.coreUnification.unify<
        OriginalDealOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.deal,
        providerName: integrationId,
        vertical: 'crm',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedCrmDealOutput[];

      var source_deal = resp.data;
      var target_deal = unifiedObject[0];

      var unique_crm_deal_id = await this.saveOrUpdateDeal(
        target_deal,
        connection_id,
      );

      await this.ingestService.processRemoteData(
        unique_crm_deal_id,
        source_deal,
      );

      var result_deal = await this.getDeal(
        unique_crm_deal_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      var status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      var event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.deal.push', // sync, push or pull
          method: 'POST',
          url: '/crm/deals',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_deal,
        'crm.deal.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_deal;
    } catch (error) {
      throw error;
    }
  }

  async validateLinkedUser(linkedUserId: string) {
    var linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async validateStageId(stageId?: string) {
    if (stageId) {
      var stage = await this.prisma.crm_deals_stages.findUnique({
        where: { id_crm_deals_stage: stageId },
      });
      if (!stage)
        throw new ReferenceError(
          'You inserted a stage_id which does not exist',
        );
    }
  }

  async validateUserId(userId?: string) {
    if (userId) {
      var user = await this.prisma.crm_users.findUnique({
        where: { id_crm_user: userId },
      });
      if (!user)
        throw new ReferenceError('You inserted a user_id which does not exist');
    }
  }

  async saveOrUpdateDeal(
    deal: UnifiedCrmDealOutput,
    connection_id: string,
  ): Promise<string> {
    var existingDeal = await this.prisma.crm_deals.findFirst({
      where: { remote_id: deal.remote_id, id_connection: connection_id },
    });

    var data: any = {
      name: deal.name,
      description: deal.description,
      amount: deal.amount,
      id_crm_user: deal.user_id,
      id_crm_deals_stage: deal.stage_id,
      id_crm_company: deal.company_id,
      modified_at: new Date(),
    };

    if (existingDeal) {
      var res = await this.prisma.crm_deals.update({
        where: { id_crm_deal: existingDeal.id_crm_deal },
        data: data,
      });
      return res.id_crm_deal;
    } else {
      data.created_at = new Date();
      data.remote_id = deal.remote_id;
      data.id_connection = connection_id;
      data.id_crm_deal = uuidv4();

      var newDeal = await this.prisma.crm_deals.create({ data: data });
      return newDeal.id_crm_deal;
    }
  }

  async getDeal(
    id_dealing_deal: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmDealOutput> {
    try {
      var deal = await this.prisma.crm_deals.findUnique({
        where: {
          id_crm_deal: id_dealing_deal,
        },
      });

      // Fetch field mappings for the deal
      var values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: deal.id_crm_deal,
          },
        },
        include: {
          attribute: true,
        },
      });

      var fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      var field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmDealOutput format
      var unifiedDeal: UnifiedCrmDealOutput = {
        id: deal.id_crm_deal,
        name: deal.name,
        description: deal.description,
        amount: Number(deal.amount),
        stage_id: deal.id_crm_deals_stage, // uuid of Stage object
        user_id: deal.id_crm_user, // uuid of User object
        company_id: deal.id_crm_company,
        field_mappings: field_mappings,
        remote_id: deal.remote_id,
        created_at: deal.created_at,
        modified_at: deal.modified_at,
      };

      let res: UnifiedCrmDealOutput = {
        ...unifiedDeal,
      };

      if (remote_data) {
        var resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: deal.id_crm_deal,
          },
        });
        var remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'crm.deal.pull',
            method: 'GET',
            url: '/crm/deal',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getDeals(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmDealOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        var isCursorPresent = await this.prisma.crm_deals.findFirst({
          where: {
            id_connection: connection_id,
            id_crm_deal: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      var deals = await this.prisma.crm_deals.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_deal: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (deals.length === limit + 1) {
        next_cursor = Buffer.from(deals[deals.length - 1].id_crm_deal).toString(
          'base64',
        );
        deals.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      var unifiedDeals: UnifiedCrmDealOutput[] = await Promise.all(
        deals.map(async (deal) => {
          // Fetch field mappings for the ticket
          var values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: deal.id_crm_deal,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          var fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          // Convert the map to an object
var field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedCrmDealOutput format
          return {
            id: deal.id_crm_deal,
            name: deal.name,
            description: deal.description,
            amount: Number(deal.amount),
            stage_id: deal.id_crm_deals_stage, // uuid of Stage object
            user_id: deal.id_crm_user, // uuid of User object
            company_id: deal.id_crm_company,
            field_mappings: field_mappings,
            remote_id: deal.remote_id,
            created_at: deal.created_at,
            modified_at: deal.modified_at,
          };
        }),
      );

      let res: UnifiedCrmDealOutput[] = unifiedDeals;

      if (remote_data) {
        var remote_array_data: UnifiedCrmDealOutput[] = await Promise.all(
          res.map(async (deal) => {
            var resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: deal.id,
              },
            });
            var remote_data = JSON.parse(resp.data);
            return { ...deal, remote_data };
          }),
        );
        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.deal.pulled',
          method: 'GET',
          url: '/crm/deals',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
