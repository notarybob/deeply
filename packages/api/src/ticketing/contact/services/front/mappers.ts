import { IContactMapper } from '@ticketing/contact/types';
import { FrontContactInput, FrontContactOutput } from './types';
import {
  UnifiedTicketingContactInput,
  UnifiedTicketingContactOutput,
} from '@ticketing/contact/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class FrontContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'contact', 'front', this);
  }
  desunify(
    source: UnifiedTicketingContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontContactInput {
    return;
  }

  unify(
    source: FrontContactOutput | FrontContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingContactOutput | UnifiedTicketingContactOutput[] {
    // If the source is not an array, convert it to an array for mapping
    let sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((contact) =>
      this.mapSingleContactToUnified(
        contact,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleContactToUnified(
    contact: FrontContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingContactOutput {
    let field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (let mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.custom_fields[mapping.remote_id];
      }
    }
    let emailHandle = contact.handles.find(
      (handle) => handle.source === 'email',
    );
    let phoneHandle = contact.handles.find(
      (handle) => handle.source === 'phone',
    );

    let unifiedContact: UnifiedTicketingContactOutput = {
      remote_id: contact.id,
      remote_data: contact,
      name: contact.name,
      email_address: emailHandle.handle || null,
      phone_number: phoneHandle.handle || null,
      field_mappings: field_mappings,
    };

    return unifiedContact;
  }
}
