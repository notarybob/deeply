import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalFulfillmentOrdersOutput } from '@@core/utils/types/original/original.ecommerce';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
// The following line are commented because they use code from the ATS Module, which was removed from the project
// import { ATS_PROVIDERS, ECOMMERCE_PROVIDERS } from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFulfillmentOrdersService } from '../types';
import { UnifiedEcommerceFulfillmentOrdersOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ecommerce', 'fulfillmentorders', this);
  }
  saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: any[],
    originSource: string,
    remote_data: Record<string, any>[],
    ...rest: any
  ): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  kickstartSync?(...params: any[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  syncForLinkedUser?(param: SyncLinkedUserType): Promise<void> {
    throw new Error('Method not implemented.');
  }
  removeInDb?(connection_id: string, remote_id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  onModuleInit() {
    return;
  }

  //@Cron('0 */8 * * *') // every 8 hours
  /*async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing fulfillmentorderss...');
      var users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (var user of users) {
          var projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (var project of projects) {
            var id_project = project.id_project;
            var linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                var providers = ECOMMERCE_PROVIDERS;
                for (var provider of providers) {
                  try {
                    await this.syncForLinkedUser({
                      integrationId: provider,
                      linkedUserId: linkedUser.id_linked_user,
                    });
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      var { integrationId, linkedUserId } = param;
      var service: IFulfillmentOrdersService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedEcommerceFulfillmentOrdersOutput,
        OriginalFulfillmentOrdersOutput,
        IFulfillmentOrdersService
      >(
        integrationId,
        linkedUserId,
        'ecommerce',
        'fulfillmentorders',
        service,
        [],
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    fulfillmentorderss: UnifiedEcommerceFulfillmentOrdersOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<EcommerceFulfillmentOrders[]> {
    try {
      var fulfillmentorderss_results: EcommerceFulfillmentOrders[] = [];

      var updateOrCreateFulfillmentOrders = async (
        fulfillmentorders: UnifiedEcommerceFulfillmentOrdersOutput,
        originId: string,
      ) => {
        let existingFulfillmentOrders;
        if (!originId) {
          existingFulfillmentOrders =
            await this.prisma.ecommerce_fulfillmentorderss.findFirst({
              where: {
                name: fulfillmentorders.name,
                id_connection: connection_id,
              },
            });
        } else {
          existingFulfillmentOrders =
            await this.prisma.ecommerce_fulfillmentorderss.findFirst({
              where: {
                remote_id: originId,
                id_connection: connection_id,
              },
            });
        }

        var baseData: any = {
          name: fulfillmentorders.name ?? null,
          modified_at: new Date(),
        };

        if (existingFulfillmentOrders) {
          return await this.prisma.ecommerce_fulfillmentorderss.update({
            where: {
              id_ecommerce_fulfillmentorders:
                existingFulfillmentOrders.id_ecommerce_fulfillmentorders,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ecommerce_fulfillmentorderss.create({
            data: {
              ...baseData,
              id_ecommerce_fulfillmentorders: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < fulfillmentorderss.length; i++) {
        var fulfillmentorders = fulfillmentorderss[i];
        var originId = fulfillmentorders.remote_id;

        var res = await updateOrCreateFulfillmentOrders(
          fulfillmentorders,
          originId,
        );
        var fulfillmentorders_id = res.id_ecommerce_fulfillmentorders;
        fulfillmentorderss_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          fulfillmentorders.field_mappings,
          fulfillmentorders_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          fulfillmentorders_id,
          remote_data[i],
        );
      }

      return fulfillmentorderss_results;
    } catch (error) {
      throw error;
    }
  }*/
}
