import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsObject, IsNumber } from 'class-validator';

export class HeartbeatDto {
  @ApiProperty({ example: 'srv-001', description: 'Unique identifier for the server' })
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiPropertyOptional({ example: 'App Server 1', description: 'Name of the server' })
  @IsString()
  @IsOptional()
  serverName?: string;

  @ApiPropertyOptional({ example: 'ec2-instance-1', description: 'Hostname of the server' })
  @IsString()
  @IsOptional()
  hostname?: string;

  @ApiPropertyOptional({ example: 3600, description: 'Uptime of the server in seconds' })
  @IsNumber()
  @IsOptional()
  uptime?: number;

  @ApiPropertyOptional({ example: 'production', description: 'Server environment (e.g. production, staging)' })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiPropertyOptional({ example: 'PM2', description: 'The backend backend or runner used' })
  @IsString()
  @IsOptional()
  backend?: string;

  @ApiPropertyOptional({ description: 'System resources stats' })
  @IsOptional()
  @IsObject()
  stats?: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of monitored PM2 processes' })
  @IsOptional()
  @IsArray()
  pm2?: Array<Record<string, any>>;

  @ApiPropertyOptional({ example: '2026-07-21T05:06:12.000Z', description: 'Timestamp of the heartbeat' })
  @IsString()
  @IsOptional()
  timestamp?: string;
}
