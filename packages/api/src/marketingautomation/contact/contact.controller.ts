import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  //ApiKeyAuth,
} from '@nestjs/swagger';

import { ContactService } from './services/contact.service';
import {
  UnifiedMarketingautomationContactInput,
  UnifiedMarketingautomationContactOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { QueryDto } from '@@core/utils/dtos/query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';


@ApiTags('marketingautomation/contacts')
@Controller('marketingautomation/contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(ContactController.name);
  }

  @ApiOperation({
    operationId: 'listMarketingAutomationContacts',
    summary: 'List  Contacts',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedMarketingautomationContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getContacts(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: QueryDto,
  ) {
    try {
      let { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      let { remote_data, limit, cursor } = query;
      return this.contactService.getContacts(
        connectionId,
        projectId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieveMarketingAutomationContact',
    summary: 'Retrieve Contacts',
    description:
      'Retrieve Contacts from any connected Marketingautomation software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the contact you want to retrieve.',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
    example: false,
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedMarketingautomationContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    let { linkedUserId, remoteSource, connectionId, projectId } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.contactService.getContact(
      id,
      linkedUserId,
      remoteSource,
      connectionId,
      projectId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createMarketingAutomationContact',
    summary: 'Create Contact',
    description:
      'Create a contact in any supported Marketingautomation software',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Marketingautomation software.',
    example: false,
  })
  @ApiBody({ type: UnifiedMarketingautomationContactInput })
  @ApiPostCustomResponse(UnifiedMarketingautomationContactOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addContact(
    @Body() unifiedContactData: UnifiedMarketingautomationContactInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      let { linkedUserId, remoteSource, connectionId, projectId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.contactService.addContact(
        unifiedContactData,
        connectionId,
        projectId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
