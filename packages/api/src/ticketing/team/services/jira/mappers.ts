import { ITeamMapper } from '@ticketing/team/types';
import { JiraTeamInput, JiraTeamOutput } from './types';
import {
  UnifiedTicketingTeamInput,
  UnifiedTicketingTeamOutput,
} from '@ticketing/team/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class JiraTeamMapper implements ITeamMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'team', 'jira', this);
  }
  desunify(
    source: UnifiedTicketingTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): JiraTeamInput {
    return;
  }

  unify(
    source: JiraTeamOutput | JiraTeamOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTeamOutput | UnifiedTicketingTeamOutput[] {
    // If the source is not an array, convert it to an array for mapping
    let sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((team) =>
      this.mapSingleTeamToUnified(team, connectionId, customFieldMappings),
    );
  }

  private mapSingleTeamToUnified(
    team: JiraTeamOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTeamOutput {
    let unifiedTeam: UnifiedTicketingTeamOutput = {
      remote_id: String(team.groupId),
      remote_data: team,
      name: team.name,
    };

    return unifiedTeam;
  }
}
