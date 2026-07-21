import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ default: 'default', unique: true, index: true })
  configId: string; // Ensure single configuration document

  @Prop({ default: '' })
  alertEmails: string; // Comma-separated email addresses

  @Prop({ default: true })
  emailEnabled: boolean;

  @Prop({ default: true })
  jobFailedAlertsEnabled: boolean;

  @Prop({ default: true })
  processDownAlertsEnabled: boolean;

  @Prop({ default: true })
  heartbeatLostAlertsEnabled: boolean;

  // Optional SMTP settings, fallbacks to env vars if empty
  @Prop({ default: '' })
  smtpHost?: string;

  @Prop({ default: 587 })
  smtpPort?: number;

  @Prop({ default: '' })
  smtpUser?: string;

  @Prop({ default: '' })
  smtpPass?: string;

  @Prop({ default: false })
  smtpSecure?: boolean;

  @Prop({ default: '' })
  smtpFrom?: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
