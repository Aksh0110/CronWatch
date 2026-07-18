import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = Alert & Document;

@Schema()
export class Alert {
  @Prop({ required: true })
  type: string; // e.g. HEARTBEAT_LOST, JOB_FAILED

  @Prop({ required: true, index: true })
  serverId: string;

  @Prop()
  jobName: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['INFO', 'WARNING', 'CRITICAL'] })
  severity: string;

  @Prop({ default: false })
  acknowledged: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
