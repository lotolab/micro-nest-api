import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { CommSortColNames } from 'src/api/enums';
import { QueryOptionsModel } from 'src/core/model';

export class SmartRecordDto {
  @ApiProperty({
    nullable: false,
    description: '唯一ID',
  })
  @IsNotEmpty()
  tid: string;

  @ApiProperty({
    nullable: false,
    description: '标题',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    nullable: false,
    description: '稿件内容',
  })
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'smart topic object',
    name: 'extra',
    nullable: true,
  })
  @IsOptional()
  extra?: Record<string, any>;
}

export class QuerySmartRecordListDto extends QueryOptionsModel {
  @ApiPropertyOptional({
    nullable: true,
    description: '标题',
  })
  @IsOptional()
  title?: string;

  @ValidateIf(
    (o: any) => {
      if (!o.sortColum) return true;
      return [CommSortColNames.createdAt, CommSortColNames.updatedAt].includes(
        o.sortColum,
      );
    },
    {
      message: `value only in [${CommSortColNames.createdAt} or ${CommSortColNames.updatedAt} ]`,
    },
  )
  @IsOptional()
  sortColum?: CommSortColNames;
}
