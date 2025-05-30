import { ICollectionMapper } from '@ticketing/collection/types';
import { GitlabCollectionInput, GitlabCollectionOutput } from './types';
import {
  UnifiedTicketingCollectionInput,
  UnifiedTicketingCollectionOutput,
} from '@ticketing/collection/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GitlabCollectionMapper implements ICollectionMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'collection',
      'gitlab',
      this,
    );
  }
  desunify(
    source: UnifiedTicketingCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GitlabCollectionInput {
    let result: GitlabCollectionInput = {
      name: source.name,
      description: source.description ? source.description : null,
      path: source.name,
    };

    return result;
  }

  unify(
    source: GitlabCollectionOutput | GitlabCollectionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingCollectionOutput | UnifiedTicketingCollectionOutput[] {
    // If the source is not an array, convert it to an array for mapping
    let sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((collection) =>
      this.mapSingleCollectionToUnified(
        collection,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleCollectionToUnified(
    collection: GitlabCollectionOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingCollectionOutput {
    let unifiedCollection: UnifiedTicketingCollectionOutput = {
      remote_id: String(collection.id),
      remote_data: collection,
      name: collection.name,
      description: collection.name,
      collection_type: 'PROJECT',
    };

    return unifiedCollection;
  }
}
