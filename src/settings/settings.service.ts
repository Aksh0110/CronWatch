import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Alert } from '../alerts/schemas/alert.schema';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  /**
   * Gets the global settings configuration, creating a default one if it does not exist yet.
   */
  async getSettings(): Promise<Settings> {
    let settings = await this.settingsModel.findOne({ configId: 'default' }).exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        configId: 'default',
        alertEmails: '',
        emailEnabled: true,
        jobFailedAlertsEnabled: true,
        processDownAlertsEnabled: true,
        heartbeatLostAlertsEnabled: true,
      });
    }
    return settings;
  }

  /**
   * Updates settings with the provided data.
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    let settings = await this.settingsModel.findOne({ configId: 'default' }).exec();
    if (!settings) {
      settings = new this.settingsModel({ configId: 'default' });
    }

    Object.assign(settings, dto);
    return settings.save();
  }

  /**
   * Constructs a Nodemailer transporter using saved database settings or environment variables.
   */
  private createTransporter(settings: Settings): nodemailer.Transporter {
    const host = settings.smtpHost || process.env.SMTP_HOST || '';
    const port = settings.smtpPort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
    const user = settings.smtpUser || process.env.SMTP_USER || '';
    const pass = settings.smtpPass || process.env.SMTP_PASS || '';
    const secure = settings.smtpSecure !== undefined ? settings.smtpSecure : (process.env.SMTP_SECURE === 'true');

    if (!host) {
      this.logger.warn('SMTP Host is not configured. Cannot send email.');
      throw new Error('SMTP host configuration missing.');
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  /**
   * Gets the sender address.
   */
  private getFromAddress(settings: Settings): string {
    return settings.smtpFrom || process.env.SMTP_FROM || '"CronWatch" <noreply@cronwatch.local>';
  }

  /**
   * Triggers a test email to verify SMTP credentials.
   */
  async sendTestEmail(settingsDto: UpdateSettingsDto, targetEmail?: string): Promise<void> {
    const settings = new this.settingsModel(settingsDto);
    const recipient = targetEmail || settings.alertEmails.split(',')[0]?.trim();

    if (!recipient) {
      throw new Error('No recipient email specified for test.');
    }

    const transporter = this.createTransporter(settings);
    const from = this.getFromAddress(settings);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CronWatch SMTP Test</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 40px 20px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; padding: 24px; text-align: center; }
          .content { padding: 32px; line-height: 1.6; }
          .success-badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: 700; font-size: 0.875rem; padding: 6px 16px; border-radius: 20px; margin-bottom: 20px; text-transform: uppercase; }
          .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 0.75rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 1.5rem; letter-spacing: -0.02em;">CronWatch Configuration</h2>
          </div>
          <div class="content">
            <div class="success-badge">SMTP Configured Successfully</div>
            <p>Hello,</p>
            <p>This is a test email from <strong>CronWatch</strong> to confirm that your SMTP connection settings are working properly.</p>
            <p>If you received this message, your SMTP credentials are valid and you are ready to receive live alert notifications.</p>
            <p style="margin-top: 30px; font-size: 0.875rem; color: #64748b;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            CronWatch Monitoring Tool &bull; Automatic System Notification
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: recipient,
      subject: '🧪 [CronWatch] SMTP Connection Test Successful',
      html: htmlContent,
    });

    this.logger.log(`Test email successfully sent to: ${recipient}`);
  }

  /**
   * Evaluates an alert and sends an email alert asynchronously if configured and enabled.
   */
  async sendAlertEmail(alert: Alert): Promise<void> {
    try {
      const settings = await this.getSettings();

      if (!settings.emailEnabled || !settings.alertEmails) {
        this.logger.debug('Email alerts are disabled or no recipient emails are configured.');
        return;
      }

      // Check alert specific configurations
      if (alert.type === 'JOB_FAILED' && !settings.jobFailedAlertsEnabled) return;
      if (alert.type === 'PROCESS_DOWN' && !settings.processDownAlertsEnabled) return;
      if (alert.type === 'HEARTBEAT_LOST' && !settings.heartbeatLostAlertsEnabled) return;

      const recipients = settings.alertEmails.split(',').map(e => e.trim()).filter(Boolean);
      if (recipients.length === 0) return;

      const transporter = this.createTransporter(settings);
      const from = this.getFromAddress(settings);

      // Select colors based on severity
      let themeColor = '#ef4444'; // Red for CRITICAL/default
      if (alert.severity === 'WARNING') themeColor = '#f97316'; // Orange
      if (alert.severity === 'INFO') themeColor = '#3b82f6'; // Blue

      const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5173';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CronWatch Alert</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 40px 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background-color: ${themeColor}; color: #ffffff; padding: 24px; text-align: center; }
            .content { padding: 32px; }
            .alert-badge { display: inline-block; background-color: ${themeColor}15; color: ${themeColor}; font-weight: 700; font-size: 0.75rem; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .table th { text-align: left; padding: 10px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.875rem; width: 120px; }
            .table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
            .msg-box { background-color: #f8fafc; border-left: 4px solid ${themeColor}; padding: 16px; font-family: monospace; font-size: 0.875rem; white-space: pre-wrap; margin: 20px 0; color: #334155; }
            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 600; font-size: 0.875rem; padding: 12px 24px; border-radius: 6px; text-decoration: none; text-align: center; margin-top: 20px; }
            .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 0.75rem; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; font-size: 1.5rem; letter-spacing: -0.02em;">⚠️ Infrastructure Alert</h2>
            </div>
            <div class="content">
              <div class="alert-badge">${alert.severity} Alert</div>
              <p style="font-size: 1.125rem; font-weight: 600; margin-top: 0; color: #0f172a;">A new system alert has been triggered.</p>
              
              <table class="table">
                <tr>
                  <th>Alert Type</th>
                  <td><strong>${alert.type}</strong></td>
                </tr>
                <tr>
                  <th>Server</th>
                  <td>${alert.serverId}</td>
                </tr>
                ${alert.jobName ? `<tr><th>Job Name</th><td>${alert.jobName}</td></tr>` : ''}
                <tr>
                  <th>Severity</th>
                  <td><span style="color: ${themeColor}; font-weight: 600;">${alert.severity}</span></td>
                </tr>
                <tr>
                  <th>Detected At</th>
                  <td>${new Date(alert.createdAt).toLocaleString()}</td>
                </tr>
              </table>

              <p style="font-weight: 600; margin-bottom: 8px;">Details:</p>
              <div class="msg-box">${alert.message}</div>

              <center>
                <a href="${dashboardUrl}" class="btn" style="color: #ffffff;">View in Dashboard</a>
              </center>
            </div>
            <div class="footer">
              CronWatch Monitoring Tool &bull; Automatic System Notification
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from,
        to: recipients.join(', '),
        subject: `⚠️ [CronWatch] [${alert.severity}] ${alert.type} - Server: ${alert.serverId}`,
        html: htmlContent,
      });

      this.logger.log(`Alert email successfully sent to ${recipients.length} recipients for alert [${alert.type}]`);
    } catch (err: any) {
      this.logger.error(`Failed to send alert email: ${err.message}`);
    }
  }
}
