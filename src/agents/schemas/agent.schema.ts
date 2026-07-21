import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true, unique: true, index: true })
  serverId: string;

  @Prop({ required: true })
  serverName: string;

  @Prop({ required: true })
  hostname: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  environment: string;

  @Prop({ required: true })
  backend: string;

  @Prop({ required: true, enum: ['ONLINE', 'OFFLINE'], default: 'ONLINE' })
  status: string;

  @Prop({ default: Date.now })
  lastHeartbeat: Date;

  @Prop({ type: Object, required: false })
  stats?: Record<string, any>;

  @Prop({ type: [Object], required: false })
  pm2?: Array<Record<string, any>>;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
