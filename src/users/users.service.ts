import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { username, email, password, name, role } = createUserDto;

    // Check if username or email already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'admin',
      isActive: true,
    });

    return newUser.save();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { username, email, password, name, role, isActive } = updateUserDto;

    // Build query conditions to check for duplicates
    const conflictConditions: any[] = [];
    if (username && username.toLowerCase() !== user.username) {
      conflictConditions.push({ username: username.toLowerCase() });
    }
    if (email && email.toLowerCase() !== user.email) {
      conflictConditions.push({ email: email.toLowerCase() });
    }

    if (conflictConditions.length > 0) {
      const existingUser = await this.userModel.findOne({
        _id: { $ne: id },
        $or: conflictConditions,
      });
      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }
    }

    // Update user properties
    if (username) user.username = username.toLowerCase();
    if (email) user.email = email.toLowerCase();
    if (name !== undefined) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    return user.save();
  }

  async remove(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
