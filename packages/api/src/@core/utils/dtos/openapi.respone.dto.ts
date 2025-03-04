import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export let ApiGetArrayCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      schema: {
        type: 'array',
        items: { $ref: getSchemaPath(dataDto) },
      },
    }),
  );

export let ApiGetCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      schema: {
        $ref: getSchemaPath(dataDto),
      },
    }),
  );

export let ApiPostCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiCreatedResponse({
      schema: {
        $ref: getSchemaPath(dataDto),
      },
    }),
  );

export let ApiPostGenericJson = (description: string) => {
  return applyDecorators(
    ApiCreatedResponse({
      schema: {
        type: 'object',
        additionalProperties: true,
        description: description,
      },
    }),
  );
};
export let ApiPostArrayCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiCreatedResponse({
      schema: {
        type: 'array',
        items: { $ref: getSchemaPath(dataDto) },
      },
    }),
  );

export class PaginatedDto<TData> {
  @ApiProperty({ type: 'string', nullable: true })
  prev_cursor: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  next_cursor: string | null;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  data: TData[];
}

export let ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
