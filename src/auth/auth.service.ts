import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Return user without password
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...result } = user.toObject();
    return result;
  }
}
