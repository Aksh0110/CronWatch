import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false })
  name?: string;

  @Prop({ required: true, default: 'admin' })
  role: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
