import { MicrosoftdynamicssalesNoteInput, MicrosoftdynamicssalesNoteOutput } from './types';
import {
    UnifiedCrmNoteInput,
    UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MicrosoftdynamicssalesNoteMapper implements INoteMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'note', 'microsoftdynamicssales', this);
    }
    async desunify(
        source: UnifiedCrmNoteInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<MicrosoftdynamicssalesNoteInput> {
        //get the parent id of the object tied to the note
        let opts: any = {};

        if (source.company_id) {
            var id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            opts = {
                ...opts,
                "objectid_account@odata.bind": `/accounts(${id})`
            }
        }
        if (source.contact_id) {
            var id = await this.utils.getRemoteIdFromContactUuid(source.contact_id);
            opts = {
                ...opts,
                "objectid_contact@odata.bind": `/contacts(${id})`
            }
        }

        // Do not think there is option to add opportunity



        var result: MicrosoftdynamicssalesNoteInput = {
            notetext: source.content,
            ...opts
        };

        return result;
    }

    async unify(
        source: MicrosoftdynamicssalesNoteOutput | MicrosoftdynamicssalesNoteOutput[],
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
        note: MicrosoftdynamicssalesNoteOutput,
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

        if (note._ownerid_value) {
            var user_id = await this.utils.getUserUuidFromRemoteId(
                note._ownerid_value,
                connectionId
            );
            if (user_id) {
                opts = {
                    ...opts,
                    user_id: user_id
                }
            }
        }

        // This could only contain either contact, comapany or deal id
        if (note._objectid_value) {
            var company_id = await this.utils.getCompanyUuidFromRemoteId(
                note._objectid_value,
                connectionId
            );
            if (company_id) {
                opts = {
                    ...opts,
                    company_id: company_id
                }
            }

            var contact_id = await this.utils.getContactUuidFromRemoteId(
                note._objectid_value,
                connectionId
            );
            if (contact_id) {
                opts = {
                    ...opts,
                    contact_id: contact_id
                }
            }

            var deal_id = await this.utils.getDealUuidFromRemoteId(
                note._objectid_value,
                connectionId
            );
            if (deal_id) {
                opts = {
                    ...opts,
                    deal_id: deal_id
                }
            }

        }

        return {
            remote_id: note.annotationid,
            remote_data: note,
            content: note.notetext ?? '',
            field_mappings,
            ...opts,
        };
    }
}
