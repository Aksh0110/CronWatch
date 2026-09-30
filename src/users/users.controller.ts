import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('User Management')
@ApiBearerAuth()
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users', description: 'Returns a list of all registered users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Successful response.' })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => {
      const { password, ...result } = user.toObject();
      return result;
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user', description: 'Creates a new user with a specific role (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Username or email already exists.' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user.toObject();
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user', description: 'Updates user details (Admin only)' })
  @ApiParam({ name: 'id', description: 'The user database identifier' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Username or email conflict.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    const { password, ...result } = user.toObject();
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user', description: 'Deletes a user from the system (Admin only)' })
  @ApiParam({ name: 'id', description: 'The user database identifier' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    const { password, ...result } = user.toObject();
    return result;
  }
}
