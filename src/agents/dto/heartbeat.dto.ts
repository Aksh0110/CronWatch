import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class HeartbeatDto {
  @ApiProperty({ example: 'srv-001', description: 'Unique identifier for the server' })
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiPropertyOptional({ description: 'System resources stats' })
  @IsOptional()
  @IsObject()
  stats?: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of monitored PM2 processes' })
  @IsOptional()
  @IsArray()
  pm2?: Array<Record<string, any>>;
}
