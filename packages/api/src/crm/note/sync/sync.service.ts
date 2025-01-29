import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { CrmObject } from '@crm/@lib/@types';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedCrmNoteOutput } from '../types/model.unified';
import { INoteService } from '../types';
import { crm_notes as CrmNote } from '@prisma/client';
import { OriginalNoteOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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
    this.registry.registerService('crm', 'note', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our crm_notes table
  //its role is to fetch all notes from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      var linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          var providers = CRM_PROVIDERS;
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
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      var { integrationId, linkedUserId } = param;
      var service: INoteService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:crm, commonObject: note} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedCrmNoteOutput,
        OriginalNoteOutput,
        INoteService
      >(integrationId, linkedUserId, 'crm', 'note', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedCrmNoteOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmNote[]> {
    try {
      var notes_results: CrmNote[] = [];

      var updateOrCreateNote = async (
        note: UnifiedCrmNoteOutput,
        originId: string,
      ) => {
        var existingNote = await this.prisma.crm_notes.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        var baseData: any = {
          content: note.content ?? null,
          id_crm_contact: note.contact_id ?? null,
          id_crm_company: note.company_id ?? null,
          id_crm_deal: note.deal_id ?? null,
          id_crm_user: note.user_id ?? null,
          modified_at: new Date(),
        };

        if (existingNote) {
          return await this.prisma.crm_notes.update({
            where: {
              id_crm_note: existingNote.id_crm_note,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.crm_notes.create({
            data: {
              ...baseData,
              id_crm_note: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        var note = data[i];
        var originId = note.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        var res = await updateOrCreateNote(note, originId);
        var note_id = res.id_crm_note;
        notes_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          note.field_mappings,
          note_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(note_id, remote_data[i]);
      }
      return notes_results;
    } catch (error) {
      throw error;
    }
  }
}
