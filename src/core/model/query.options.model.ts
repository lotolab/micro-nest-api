import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { OrderbyModeEnum } from '../enums';

export class QueryOptionsModel implements IQueryOptions {
  @ApiPropertyOptional({
    required: false,
    description: 'Number of items displayed per page',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value ? Number(value) : value))
  readonly pageSize?: number;

  @ApiPropertyOptional({
    required: false,
    description: 'Current page number',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value ? Number(value) : value))
  readonly page?: number;

  @ApiPropertyOptional({
    required: false,
    description: '排序顺序',
  })
  @IsOptional()
  readonly orderMode?: OrderbyModeEnum;
}
