import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Utils } from '@crm/@lib/@utils';
import { INoteMapper } from '@crm/note/types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { Injectable } from '@nestjs/common';
import { SalesforceNoteInput, SalesforceNoteOutput } from './types';

@Injectable()
export class SalesforceNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'salesforce', this);
  }

  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SalesforceNoteInput> {
    var result: SalesforceNoteInput = {
      Content: source.content,
      Title: source.content, // TODO: source.title || 'Note',
    };

    if (source.user_id) {
      var owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.OwnerId = owner_id;
      }
    }

    if (source.deal_id) {
      var id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      result.ParentId = id;
    } else if (source.contact_id) {
      var id = await this.utils.getRemoteIdFromContactUuid(source.contact_id);
      result.ParentId = id;
    } else if (source.company_id) {
      var id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
      result.ParentId = id;
    }

    if (customFieldMappings && source.field_mappings) {
      for (var [k, v] of Object.entries(source.field_mappings)) {
        var mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: SalesforceNoteOutput | SalesforceNoteOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmNoteOutput | UnifiedCrmNoteOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleNoteToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    return Promise.all(
      source.map((note) =>
        this.mapSingleNoteToUnified(note, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleNoteToUnified(
    note: SalesforceNoteOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmNoteOutput> {
    var field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (var mapping of customFieldMappings) {
        field_mappings[mapping.slug] = note[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (note.OwnerId) {
      var owner_id = await this.utils.getUserUuidFromRemoteId(
        note.OwnerId,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (note.ParentId) {
      // Determine the type of the parent (deal, contact, or company)
      // This might require additional API calls or logic to determine the object type
      // For this example, we'll assume it's a deal, but you should implement proper logic here
      opts.deal_id = await this.utils.getDealUuidFromRemoteId(
        note.ParentId,
        connectionId,
      );
    }

    return {
      remote_id: note.Id,
      remote_data: note,
      content: note.Body,
      title: note.Title,
      field_mappings,
      ...opts,
    };
  }
}