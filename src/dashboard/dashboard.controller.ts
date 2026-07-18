import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics', description: 'Returns overall counts for servers, running/healthy/failed jobs, and the list of latest executions' })
  @ApiResponse({ status: 200, description: 'Successful response.' })
  async getDashboard() {
    return this.dashboardService.getDashboardData();
  }
}
