import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { Alert, AlertDocument } from '../alerts/schemas/alert.schema';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';

@Injectable()
export class AgentsService implements OnModuleInit, OnModuleDestroy {
  private offlineCheckInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
  ) {}

  onModuleInit() {
    // Check for offline agents every 60 seconds
    this.offlineCheckInterval = setInterval(async () => {
      await this.checkOfflineAgents();
    }, 60000);
  }

  onModuleDestroy() {
    if (this.offlineCheckInterval) {
      clearInterval(this.offlineCheckInterval);
    }
  }

  async register(dto: RegisterAgentDto): Promise<Agent> {
    const updatedAgent = await this.agentModel.findOneAndUpdate(
      { serverId: dto.serverId },
      {
        ...dto,
        status: 'ONLINE',
        lastHeartbeat: new Date(),
      },
      { new: true, upsert: true },
    );
    return updatedAgent;
  }

  async heartbeat(dto: HeartbeatDto): Promise<Agent> {
    const agent = await this.agentModel.findOneAndUpdate(
      { serverId: dto.serverId },
      {
        status: 'ONLINE',
        lastHeartbeat: new Date(),
      },
      { new: true },
    );

    if (!agent) {
      throw new NotFoundException(`Agent with serverId ${dto.serverId} not found`);
    }

    return agent;
  }

  async findAll(): Promise<Agent[]> {
    return this.agentModel.find().exec();
  }

  async checkOfflineAgents(): Promise<void> {
    const threshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    // Find ONLINE agents whose last heartbeat is older than threshold
    const offlineAgents = await this.agentModel.find({
      status: 'ONLINE',
      lastHeartbeat: { $lt: threshold },
    }).exec();

    for (const agent of offlineAgents) {
      // Update status to OFFLINE
      agent.status = 'OFFLINE';
      await agent.save();

      // Create an alert
      const alertMessage = `Server '${agent.serverName || agent.serverId}' (IP: ${agent.ipAddress}) went OFFLINE. Last heartbeat was at ${agent.lastHeartbeat.toISOString()}.`;
      
      // Check if an unacknowledged offline alert already exists for this server to avoid duplicate alerts
      const existingAlert = await this.alertModel.findOne({
        serverId: agent.serverId,
        type: 'HEARTBEAT_LOST',
        acknowledged: false,
      }).exec();

      if (!existingAlert) {
        await this.alertModel.create({
          type: 'HEARTBEAT_LOST',
          serverId: agent.serverId,
          message: alertMessage,
          severity: 'CRITICAL',
          acknowledged: false,
          createdAt: new Date(),
        });
      }
    }
  }
}
