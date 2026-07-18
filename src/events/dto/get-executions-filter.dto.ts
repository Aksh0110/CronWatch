import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetExecutionsFilterDto {
  @ApiPropertyOptional({ description: 'Filter by serverId' })
  @IsString()
  @IsOptional()
  serverId?: string;

  @ApiPropertyOptional({ description: 'Filter by jobName' })
  @IsString()
  @IsOptional()
  jobName?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsString()
  @IsOptional()
  status?: string;

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
