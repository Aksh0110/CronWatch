import { Controller, Get, Post, Body, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetExecutionsFilterDto } from './dto/get-executions-filter.dto';
import { Execution } from './schemas/execution.schema';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Events & Executions')
@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Store an execution event', description: 'Records a cron job execution event, calculating duration and triggering alerts on failures' })
  @ApiResponse({ status: 201, description: 'Event stored successfully.', type: Execution })
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<Execution> {
    return this.eventsService.create(createEventDto);
  }

  @Get('executions')
  @ApiOperation({ summary: 'List all executions', description: 'Returns a list of all execution events, with optional filtering and pagination parameters' })
  @ApiResponse({ status: 200, description: 'Successful response.', type: [Execution] })
  async getExecutions(@Query() filterDto: GetExecutionsFilterDto): Promise<Execution[]> {
    return this.eventsService.findAll(filterDto);
  }
}
