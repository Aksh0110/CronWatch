import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetAlertsFilterDto {
  @ApiPropertyOptional({ description: 'Filter by serverId' })
  @IsString()
  @IsOptional()
  serverId?: string;

  @ApiPropertyOptional({ description: 'Filter by jobName' })
  @IsString()
  @IsOptional()
  jobName?: string;

  @ApiPropertyOptional({ description: 'Filter by severity (INFO, WARNING, CRITICAL)' })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ description: 'Filter by acknowledged status' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  acknowledged?: boolean;

  @ApiPropertyOptional({ description: 'Limit number of results', default: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Skip number of results for pagination', default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;
}
