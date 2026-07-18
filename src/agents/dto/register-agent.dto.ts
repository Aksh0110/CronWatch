import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIP } from 'class-validator';

export class RegisterAgentDto {
  @ApiProperty({ example: 'srv-001', description: 'Unique identifier for the server' })
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiProperty({ example: 'App Server 1', description: 'Name of the server' })
  @IsString()
  @IsNotEmpty()
  serverName: string;

  @ApiProperty({ example: 'ec2-instance-1', description: 'Hostname of the server' })
  @IsString()
  @IsNotEmpty()
  hostname: string;

  @ApiProperty({ example: '192.168.1.10', description: 'IP address of the server' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'production', description: 'Server environment (e.g. production, staging)' })
  @IsString()
  @IsNotEmpty()
  environment: string;

  @ApiProperty({ example: 'PM2', description: 'The backend backend or runner used' })
  @IsString()
  @IsNotEmpty()
  backend: string;
}
