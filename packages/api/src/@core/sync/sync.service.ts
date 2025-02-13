import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectorCategory, getCommonObjectsForVertical } from '@panora/shared';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CoreSyncRegistry } from '../@core-services/registries/core-sync.registry';
import { UpdatePullFrequencyDto } from './sync.controller';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoreSyncService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
  ) {
    this.logger.setContext(CoreSyncService.name);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAndKickstartSync(user_id?: string) {
    try {
      let users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (let user of users) {
          try {
            let projects = await this.prisma.projects.findMany({
              where: {
                id_user: user.id_user,
              },
            });
            for (let project of projects) {
              try {
                let projectSyncConfig =
                  await this.prisma.projects_pull_frequency.findFirst({
                    where: {
                      id_project: project.id_project,
                    },
                  });

                if (projectSyncConfig) {
                  let syncIntervals = {
                    crm: projectSyncConfig.crm,
                    accounting: projectSyncConfig.accounting,
                    filestorage: projectSyncConfig.filestorage,
                    ecommerce: projectSyncConfig.ecommerce,
                    ticketing: projectSyncConfig.ticketing,
                  };

                  for (let [vertical, interval] of Object.entries(
                    syncIntervals,
                  )) {
                    if (interval && interval > 0) {
                      let now = new Date();
                      let lastSyncEvent = await this.prisma.events.findFirst({
                        where: {
                          id_project: project.id_project,
                          type: `${vertical}.batchSyncStart`,
                        },
                        orderBy: {
                          timestamp: 'desc',
                        },
                      });

                      let lastSyncTime = lastSyncEvent
                        ? lastSyncEvent.timestamp
                        : new Date(0);

                      let secondsSinceLastSync =
                        Number(now.getTime() - lastSyncTime.getTime()) / 1000;

                      if (interval && secondsSinceLastSync >= interval) {
                        await this.prisma.events.create({
                          data: {
                            id_project: project.id_project,
                            id_event: uuidv4(),
                            status: 'success',
                            type: `${vertical}.batchSyncStart`,
                            method: 'GET',
                            url: '',
                            provider: '',
                            direction: '0',
                            timestamp: new Date(),
                          },
                        });
                        let commonObjects =
                          getCommonObjectsForVertical(vertical);
                        for (let commonObject of commonObjects) {
                          try {
                            let service = this.registry.getService(
                              vertical,
                              commonObject,
                            );
                            if (service) {
                              try {
                                let cronExpression =
                                  this.convertIntervalToCron(Number(interval));

                                await this.bullQueueService.queueSyncJob(
                                  `${vertical}-sync-${commonObject}s-${project.id_project}`,
                                  {
                                    projectId: project.id_project,
                                    vertical,
                                    commonObject,
                                  },
                                  cronExpression,
                                );
                                this.logger.log(
                                  `Synced ${vertical}.${commonObject} for project ${project.id_project}`,
                                );
                              } catch (error) {
                                this.logger.error(
                                  `Error syncing ${vertical}.${commonObject} for project ${project.id_project}: ${error.message}`,
                                  error,
                                );
                              }
                            } else {
                              this.logger.warn(
                                `No service found for ${vertical}.${commonObject}`,
                              );
                            }
                          } catch (error) {
                            this.logger.error(
                              `Error processing ${vertical}.${commonObject} for project ${project.id_project}: ${error.message}`,
                              error,
                            );
                          }
                        }
                      }
                    } else {
                      let commonObjects =
                        getCommonObjectsForVertical(vertical);
                      for (let commonObject of commonObjects) {
                        await this.bullQueueService.removeRepeatableJob(
                          `${vertical}-sync-${commonObject}s-${project.id_project}`,
                        );
                      }
                    }
                  }
                }
              } catch (projectError) {
                this.logger.error(
                  `Error processing project: ${projectError.message}`,
                  projectError,
                );
              }
            }
          } catch (userError) {
            this.logger.error(
              `Error processing user: ${userError.message}`,
              userError,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in checkAndKickstartSync: ${error.message}`,
        error,
      );
    }
  }

  private convertIntervalToCron(intervalSeconds: number): string {
    // If the interval is less than 1 minute, we'll set it to run every minute
    if (intervalSeconds < 60) {
      return '* * * * *';
    }

    // If the interval is less than 1 hour, use minutes
    if (intervalSeconds < 3600) {
      let minutes = Math.floor(intervalSeconds / 60);
      return `*/${minutes} * * * *`;
    }

    // If the interval is less than 1 day, use hours
    if (intervalSeconds < 86400) {
      let hours = Math.floor(intervalSeconds / 3600);
      return `0 */${hours} * * *`;
    }

    // For intervals of 1 day or more, use days
    let days = Math.floor(intervalSeconds / 86400);
    return `0 0 */${days} * *`;
  }

  //Initial sync which will execute when connection is successfully established
  async initialSync(vertical: string, provider: string, linkedUserId: string) {
    try {
      switch (vertical) {
        case ConnectorCategory.Crm:
          await this.handleCrmSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Ticketing:
          await this.handleTicketingSync(provider, linkedUserId);
          break;
        case ConnectorCategory.FileStorage:
          await this.handleFileStorageSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Accounting:
          await this.handleAccountingSync(provider, linkedUserId);
          break;
        case ConnectorCategory.Ecommerce:
          await this.handleEcommerceSync(provider, linkedUserId);
          break;
        default:
          this.logger.warn(`Unsupported vertical: ${vertical}`);
      }
    } catch (error) {
      this.logger.error(`Error in initialSync: ${error.message}`, error);
      throw error;
    }
  }

  // todo
  async handleAccountingSync(provider: string, linkedUserId: string) {
    return;
  }

  async handleCrmSync(provider: string, linkedUserId: string) {
    let tasks = [
      () =>
        this.registry.getService('crm', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('crm', 'company').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('crm', 'contact').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('crm', 'deal').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];

    for (let type of ENGAGEMENTS_TYPE) {
      tasks.push(() =>
        this.registry.getService('crm', 'engagement').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          engagement_type: type,
        }),
      );
    }

    tasks.push(() =>
      this.registry.getService('crm', 'note').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
      }),
    );
    tasks.push(() =>
      this.registry.getService('crm', 'task').syncForLinkedUser({
        integrationId: provider,
        linkedUserId: linkedUserId,
      }),
    );

    // Execute all tasks and handle results
    for (let task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Task failed: ${error.message}`, error);
      }
    }

    let connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    let deals = await this.prisma.crm_deals.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    let stageTasks = deals.map(
      (deal) => async () =>
        this.registry.getService('crm', 'stage').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          deal_id: deal.id_crm_deal,
        }),
    );

    // Execute all tasks and handle results
    for (let task of stageTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Stage Task failed: ${error.message}`, error);
      }
    }
  }

  async handleTicketingSync(provider: string, linkedUserId: string) {
    //todo: define here the topological order PER provider
    let tasks = [
      () =>
        this.registry.getService('ticketing', 'collection').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'ticket').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'team').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'account').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ticketing', 'contact').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];

    let connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    for (let task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Task failed: ${error.message}`, error);
      }
    }
    let tickets = await this.prisma.tcg_tickets.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    let ticketCommentTasks = tickets.map(
      (ticket) => async () =>
        this.registry.getService('ticketing', 'comment').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_ticket: ticket.id_tcg_ticket,
        }),
    );

    let ticketTagsTasks = tickets.map(
      (ticket) => async () =>
        this.registry.getService('ticketing', 'tag').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_ticket: ticket.id_tcg_ticket,
        }),
    );

    for (let task of ticketCommentTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(
          `Ticket Comment task failed: ${error.message}`,
          error,
        );
      }
    }

    for (let task of ticketTagsTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Ticket Tags task failed: ${error.message}`, error);
      }
    }
  }

  async handleFileStorageSync(provider: string, linkedUserId: string) {
    let tasks = [
      () =>
        this.registry.getService('filestorage', 'user').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'group').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'drive').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'folder').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('filestorage', 'file').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];
    // if (provider == 'googledrive') {
    //   tasks.push(() =>
    //     this.registry.getService('filestorage', 'file').syncForLinkedUser({
    //       integrationId: provider,
    //       linkedUserId: linkedUserId,
    //     }),
    //   );
    // }
    for (let task of tasks) {
      try {
        await task();
      } catch (error) {
        console.log(error);
        this.logger.error(`File Storage Task failed: ${error.message}`, error);
      }
    }

    let connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    // let folders = await this.prisma.fs_folders.findMany({
    //   where: {
    //     id_connection: connection.id_connection,
    //   },
    // });
    // if (provider !== 'googledrive') {
    //   let filesTasks = folders.map(
    //     (folder) => async () =>
    //       this.registry.getService('filestorage', 'file').syncForLinkedUser({
    //         integrationId: provider,
    //         linkedUserId: linkedUserId,
    //         id_folder: folder.id_fs_folder,
    //       }),
    //   );

    //   for (let task of filesTasks) {
    //     try {
    //       await task();
    //     } catch (error) {
    //       console.log(error);
    //       this.logger.error(`File Task failed: ${error.message}`, error);
    //     }
    //   }
    // }
  }

  async handleEcommerceSync(provider: string, linkedUserId: string) {
    let tasks = [
      () =>
        this.registry.getService('ecommerce', 'customer').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ecommerce', 'product').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
      () =>
        this.registry.getService('ecommerce', 'order').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
        }),
    ];
    for (let task of tasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Ecommerce Task failed: ${error.message}`, error);
      }
    }

    let connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
        provider_slug: provider.toLowerCase(),
      },
    });

    let orders = await this.prisma.ecom_orders.findMany({
      where: {
        id_connection: connection.id_connection,
      },
    });

    let fulfTasks = orders.map(
      (order) => async () =>
        this.registry.getService('ecommerce', 'fulfillment').syncForLinkedUser({
          integrationId: provider,
          linkedUserId: linkedUserId,
          id_order: order.id_ecom_order,
        }),
    );

    for (let task of fulfTasks) {
      try {
        await task();
      } catch (error) {
        this.logger.error(`Fulfillment Task failed: ${error.message}`, error);
      }
    }
  }

  // we must have a sync_jobs table with 7 (verticals) rows, one of each is syncing details
  async getSyncStatus(vertical: string) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async resync(vertical: string, providerName: string, linkedUserId: string) {
    try {
      await this.initialSync(
        vertical.toLowerCase(),
        providerName.toLowerCase(),
        linkedUserId,
      );
      return {
        timestamp: new Date(),
        vertical: vertical,
        provider: providerName,
        status: `SYNCING`,
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePullFrequency(data: UpdatePullFrequencyDto, projectId: string) {
    return await this.prisma.projects_pull_frequency.upsert({
      where: { id_project: projectId },
      update: {
        ...data,
        modified_at: new Date(),
      },
      create: {
        id_projects_pull_frequency: uuidv4(),
        id_project: projectId,
        ...data,
      },
    });
  }

  async getPullFrequency(projectId: string) {
    return await this.prisma.projects_pull_frequency.findFirst({
      where: { id_project: projectId },
    });
  }
}
