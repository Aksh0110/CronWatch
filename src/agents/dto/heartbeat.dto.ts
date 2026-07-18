import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class HeartbeatDto {
  @ApiProperty({ example: 'srv-001', description: 'Unique identifier for the server' })
  @IsString()
  @IsNotEmpty()
  serverId: string;
}
