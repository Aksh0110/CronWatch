import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExecutionDocument = Execution & Document;

@Schema()
export class Execution {
  @Prop({ required: true, index: true })
  serverId: string;

  @Prop()
  backend: string;

  @Prop({ required: true, index: true })
  jobName: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  duration: number; // in milliseconds

  @Prop()
  message: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ExecutionSchema = SchemaFactory.createForClass(Execution);
