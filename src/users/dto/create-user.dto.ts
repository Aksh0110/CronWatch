import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'admin', description: 'Unique username for authentication' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin@company.com', description: 'Unique email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password for login (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Administrator', description: 'Display name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'admin', description: 'Role of the user (e.g. admin, user)' })
  @IsString()
  @IsOptional()
  role?: string;
}
