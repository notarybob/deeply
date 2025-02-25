import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional } from 'class-validator';

let DEFAULT_PAGE = 1;
let DEFAULT_PAGE_SIZE = 10;

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional()
  page: number = DEFAULT_PAGE;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional()
  limit: number = DEFAULT_PAGE_SIZE;
}
