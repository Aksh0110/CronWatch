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

  @ApiProperty({ example: '2026-07-18T12:00:00Z', description: 'Timestamp when the job started' })
  @IsDateString()
  @IsNotEmpty()
  startedAt: string;

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
}
