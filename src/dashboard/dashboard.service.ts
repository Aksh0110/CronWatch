import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { Execution, ExecutionDocument } from '../events/schemas/execution.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(Execution.name) private executionModel: Model<ExecutionDocument>,
  ) {}

  async getDashboardData() {
    const totalServers = await this.agentModel.countDocuments().exec();
    
    // An agent is online if status is ONLINE and heartbeat is within last 5 minutes
    const heartbeatThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const onlineServers = await this.agentModel.countDocuments({
      status: 'ONLINE',
      lastHeartbeat: { $gte: heartbeatThreshold },
    }).exec();

    // Active/running jobs are those in STARTED or RUNNING state
    const runningJobs = await this.executionModel.countDocuments({
      status: { $in: ['STARTED', 'RUNNING'] },
    }).exec();

    // Latest executions (top 10)
    const latestExecutions = await this.executionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    // Aggregate to get the latest execution status for each unique job on each server
    const jobAggregation = await this.executionModel.aggregate([
      { $sort: { startedAt: -1 } },
      {
        $group: {
          _id: { serverId: '$serverId', jobName: '$jobName' },
          latestStatus: { $first: '$status' },
        },
      },
    ]);

    let healthyJobs = 0;
    let failedJobs = 0;

    for (const job of jobAggregation) {
      const status = job.latestStatus ? job.latestStatus.toUpperCase() : '';
      if (status === 'FAILED') {
        failedJobs++;
      } else if (status === 'COMPLETED' || status === 'SUCCESS') {
        healthyJobs++;
      }
    }

    return {
      totalServers,
      onlineServers,
      runningJobs,
      healthyJobs,
      failedJobs,
      latestExecutions,
    };
  }
}
