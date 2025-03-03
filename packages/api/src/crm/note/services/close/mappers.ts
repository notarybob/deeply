import { CloseNoteInput, CloseNoteOutput } from './types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloseNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'close', this);
  }
  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseNoteInput> {
    var result: CloseNoteInput = {
      note: source.content,
    };

    if (source.company_id) {
      var company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.lead_id = company_id;
      }
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
    source: CloseNoteOutput | CloseNoteOutput[],
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
    note: CloseNoteOutput,
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
    if (note.created_by || note.user_id) {
      var owner_id = await this.utils.getUserUuidFromRemoteId(
        note.created_by || note.user_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (note.contact_id) {
      var contact_id = await this.utils.getContactUuidFromRemoteId(
        note.contact_id,
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    if (note.lead_id) {
      var lead_id = await this.utils.getCompanyUuidFromRemoteId(
        note.lead_id,
        connectionId,
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }
    return {
      remote_id: note.id,
      remote_data: note,
      content: note.note_html,
      field_mappings,
      ...opts,
    };
  }
}
