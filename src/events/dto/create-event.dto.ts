import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'srv-001', description: 'Unique identifier for the server' })
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiProperty({ example: 'PM2', description: 'Backend service/manager', required: false })
  @IsString()
  @IsOptional()
  backend?: string;

  @ApiProperty({ example: 'db-backup', description: 'Name of the cron job' })
  @IsString()
  @IsNotEmpty()
  jobName: string;

  @ApiProperty({ example: 'FAILED', description: 'Status of the cron execution (STARTED, COMPLETED, FAILED)' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: '2026-07-18T12:00:00Z', description: 'Timestamp when the job started', required: false })
  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @ApiProperty({ example: '2026-07-18T12:01:30Z', description: 'Timestamp when the job completed', required: false })
  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @ApiProperty({ example: 90000, description: 'Duration of execution in milliseconds', required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 'Error: Disk full', description: 'Log messages or failure details', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ example: 'App Server 1', description: 'Name of the server', required: false })
  @IsString()
  @IsOptional()
  serverName?: string;

  @ApiProperty({ example: 'production', description: 'Server environment', required: false })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiProperty({ example: 'ec2-instance-1', description: 'Hostname of the server', required: false })
  @IsString()
  @IsOptional()
  hostname?: string;

  @ApiProperty({ example: 'customer-cron', description: 'PM2 process name', required: false })
  @IsString()
  @IsOptional()
  processName?: string;

  @ApiProperty({ example: '2026-07-18T12:01:30Z', description: 'Event timestamp', required: false })
  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @ApiProperty({ example: '[booking-reminder-cron] Booking reminder starting...', description: 'Raw matched log line', required: false })
  @IsString()
  @IsOptional()
  rawLog?: string;

  @ApiProperty({ example: '{"type":"contains","pattern":"starting","status":"STARTED"}', description: 'Matched rule details', required: false })
  @IsString()
  @IsOptional()
  matchedRule?: string;
}
