import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'admin', description: 'Unique username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'admin@company.com', description: 'Unique email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'password123', description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'Administrator', description: 'Display name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'admin', description: 'Role of the user (admin, write, read)' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: true, description: 'Is the user active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
