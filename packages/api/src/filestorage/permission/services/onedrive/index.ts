import { Injectable } from '@nestjs/common';
import { IPermissionService } from '@filestorage/permission/types';
import { FileStorageObject } from '@panora/shared';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { OnedrivePermissionInput, OnedrivePermissionOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class OnedriveService implements IPermissionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      FileStorageObject.permission.toUpperCase() + ':' + OnedriveService.name,
    );
    this.registry.registerService('onedrive', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<OnedrivePermissionOutput[]>> {
    try {
      var { linkedUserId, extra } = data;
      //  TODO: where it comes from ??  extra?: { object_name: 'folder' | 'file'; value: string },

      var connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'onedrive',
          vertical: 'filestorage',
        },
      });
      let remote_id;
      if (extra.object_name == 'folder') {
        var a = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: extra.value,
          },
        });
        remote_id = a.remote_id;
      }
      if (extra.object_name == 'file') {
        var a = await this.prisma.fs_files.findUnique({
          where: {
            id_fs_file: extra.value,
          },
        });

        remote_id = a.remote_id;
      }

      var resp = await axios.get(
        `${connection.account_url}/v1.0/drive/items/${remote_id}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: resp.data.value as OnedrivePermissionOutput[],
        message: 'Synced onedrive permissions !',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
