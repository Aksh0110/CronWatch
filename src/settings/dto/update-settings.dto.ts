import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'admin@example.com,alerts@example.com', description: 'Comma-separated alert recipient emails' })
  @IsString()
  @IsOptional()
  alertEmails?: string;

  @ApiPropertyOptional({ example: true, description: 'Master toggle to enable/disable email notifications' })
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable emails for job failure events' })
  @IsBoolean()
  @IsOptional()
  jobFailedAlertsEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable emails for PM2 process down events' })
  @IsBoolean()
  @IsOptional()
  processDownAlertsEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Enable emails for server offline events' })
  @IsBoolean()
  @IsOptional()
  heartbeatLostAlertsEnabled?: boolean;

  @ApiPropertyOptional({ example: 'smtp.example.com', description: 'SMTP Hostname' })
  @IsString()
  @IsOptional()
  smtpHost?: string;

  @ApiPropertyOptional({ example: 587, description: 'SMTP Port' })
  @IsNumber()
  @IsOptional()
  smtpPort?: number;

  @ApiPropertyOptional({ example: 'smtp-user', description: 'SMTP Username' })
  @IsString()
  @IsOptional()
  smtpUser?: string;

  @ApiPropertyOptional({ example: 'smtp-password', description: 'SMTP Password' })
  @IsString()
  @IsOptional()
  smtpPass?: string;

  @ApiPropertyOptional({ example: false, description: 'Use SSL/TLS secure connection' })
  @IsBoolean()
  @IsOptional()
  smtpSecure?: boolean;

  @ApiPropertyOptional({ example: 'noreply@example.com', description: 'Sender email address' })
  @IsString()
  @IsOptional()
  smtpFrom?: string;
}

export class TestEmailDto {
  @IsString()
  @IsOptional()
  testEmail?: string;
}
