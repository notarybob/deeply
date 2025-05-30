import {
  UnifiedFilestorageSharedlinkInput,
  UnifiedFilestorageSharedlinkOutput,
} from '@filestorage/sharedlink/types/model.unified';
import { ISharedLinkMapper } from '@filestorage/sharedlink/types';
import { Utils } from '@filestorage/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { SharepointSharedLinkInput, SharepointSharedLinkOutput } from './types';

@Injectable()
export class SharepointSharedLinkMapper implements ISharedLinkMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService(
      'filestorage',
      'sharedlink',
      'sharepoint',
      this,
    );
  }

  async desunify(
    source: UnifiedFilestorageSharedlinkInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SharepointSharedLinkInput> {
    return;
  }

  async unify(
    source: SharepointSharedLinkOutput | SharepointSharedLinkOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedFilestorageSharedlinkOutput | UnifiedFilestorageSharedlinkOutput[]
  > {
    if (!Array.isArray(source)) {
      return await this.mapSingleSharedLinkToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of SharepointSharedLinkOutput
    return Promise.all(
      source.map((sharedlink) =>
        this.mapSingleSharedLinkToUnified(
          sharedlink,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleSharedLinkToUnified(
    sharedlink: SharepointSharedLinkOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageSharedlinkOutput> {
    let field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      customFieldMappings.forEach((mapping) => {
        field_mappings[mapping.slug] = sharedlink[mapping.remote_id];
      });
    }

    return {
      remote_id: sharedlink.id,
      remote_data: sharedlink,
      url: sharedlink.link?.webUrl,
      download_url: null,
      folder_id: null,
      file_id: null,
      scope: sharedlink.link?.scope,
      password_protected: sharedlink.hasPassword,
      password: null,
      field_mappings,
    };
  }
}
