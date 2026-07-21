import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, TestEmailDto } from './dto/update-settings.dto';
import { Settings } from './schemas/settings.schema';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification and SMTP settings', description: 'Returns the global settings document. Creates default one if not found.' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully.', type: Settings })
  async getSettings(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification and SMTP settings', description: 'Updates settings parameters in the database.' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully.', type: Settings })
  async updateSettings(@Body() dto: UpdateSettingsDto): Promise<Settings> {
    return this.settingsService.updateSettings(dto);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email', description: 'Attempts to send a test email to verify SMTP connections.' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully.' })
  async testSettings(@Body() dto: UpdateSettingsDto & TestEmailDto): Promise<{ message: string }> {
    const { testEmail, ...settingsDto } = dto;
    await this.settingsService.sendTestEmail(settingsDto, testEmail);
    return { message: 'Test email sent successfully' };
  }
}
