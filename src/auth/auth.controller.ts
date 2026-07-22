import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticates a user and returns a signed JWT token' })
  @ApiResponse({ status: 200, description: 'Authentication successful. Returns JWT token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    const validatedUser = await this.authService.validateUser(loginDto);
    return this.authService.login(validatedUser);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the profile of the currently logged-in user using JWT' })
  @ApiResponse({ status: 200, description: 'Current user profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@Req() request: any) {
    const userId = request['user'].sub;
    return this.authService.getMe(userId);
  }
}
