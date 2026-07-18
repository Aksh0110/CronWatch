import { Controller, Get, Patch, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { GetAlertsFilterDto } from './dto/get-alerts-filter.dto';
import { Alert } from './schemas/alert.schema';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List all alerts', description: 'Returns a list of all server and execution alerts, with optional status and severity filtering' })
  @ApiResponse({ status: 200, description: 'Successful response.', type: [Alert] })
  async getAlerts(@Query() filterDto: GetAlertsFilterDto): Promise<Alert[]> {
    return this.alertsService.findAll(filterDto);
  }

  @Patch(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge an alert', description: 'Marks an alert as acknowledged by its database identifier' })
  @ApiParam({ name: 'id', description: 'The unique ID of the alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully.', type: Alert })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async acknowledgeAlert(@Param('id') id: string): Promise<Alert> {
    return this.alertsService.acknowledge(id);
  }
}
