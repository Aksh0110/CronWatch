import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { Agent } from './schemas/agent.schema';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a server agent', description: 'Registers a server agent or updates its information if it already exists' })
  @ApiResponse({ status: 200, description: 'Agent registered/updated successfully.', type: Agent })
  async register(@Body() registerAgentDto: RegisterAgentDto): Promise<Agent> {
    return this.agentsService.register(registerAgentDto);
  }

  @Public()
  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send heartbeat', description: 'Updates the lastHeartbeat timestamp and sets status to ONLINE for a registered agent' })
  @ApiResponse({ status: 200, description: 'Heartbeat recorded successfully.', type: Agent })
  @ApiResponse({ status: 404, description: 'Agent not found.' })
  async heartbeat(@Body() heartbeatDto: HeartbeatDto): Promise<Agent> {
    return this.agentsService.heartbeat(heartbeatDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all agents', description: 'Returns a list of all registered server agents' })
  @ApiResponse({ status: 200, description: 'Successful response.', type: [Agent] })
  async findAll(): Promise<Agent[]> {
    return this.agentsService.findAll();
  }
}
