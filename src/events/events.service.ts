import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Execution, ExecutionDocument } from './schemas/execution.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { GetExecutionsFilterDto } from './dto/get-executions-filter.dto';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Execution.name) private executionModel: Model<ExecutionDocument>,
    private readonly alertsService: AlertsService,
  ) {}

  async create(dto: CreateEventDto): Promise<Execution> {
    const started = dto.startedAt
      ? new Date(dto.startedAt)
      : (dto.timestamp ? new Date(dto.timestamp) : new Date());
    const completed = dto.completedAt ? new Date(dto.completedAt) : null;
    let duration = dto.duration;

    if (completed && started && duration === undefined) {
      duration = completed.getTime() - started.getTime();
    }

    const executionData = {
      ...dto,
      startedAt: started,
      completedAt: completed,
      duration,
    };

    const newExecution = new this.executionModel(executionData);
    const savedExecution = await newExecution.save();

    // Automatically trigger alert if job fails
    if (dto.status === 'FAILED') {
      const alertMsg = dto.message || `Cron job '${dto.jobName}' failed on server '${dto.serverId}'.`;
      await this.alertsService.create({
        type: 'JOB_FAILED',
        serverId: dto.serverId,
        jobName: dto.jobName,
        message: alertMsg,
        severity: 'CRITICAL',
        acknowledged: false,
        createdAt: new Date(),
      });
    }

    return savedExecution;
  }

  async findAll(filter: GetExecutionsFilterDto): Promise<Execution[]> {
    const query: any = {};

    if (filter.serverId) {
      query.serverId = filter.serverId;
    }
    if (filter.jobName) {
      const escapedJobName = filter.jobName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.jobName = { $regex: escapedJobName, $options: 'i' };
    }
    if (filter.status) {
      const statusVal = filter.status.toUpperCase();
      if (statusVal === 'SUCCESS' || statusVal === 'COMPLETED') {
        query.status = { $in: ['SUCCESS', 'COMPLETED'] };
      } else if (statusVal === 'RUNNING' || statusVal === 'STARTED') {
        query.status = { $in: ['RUNNING', 'STARTED'] };
      } else {
        query.status = filter.status;
      }
    }

    const queryBuilder = this.executionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(filter.skip ?? 0);

    if (filter.limit !== undefined && filter.limit !== null) {
      queryBuilder.limit(filter.limit);
    }

    return queryBuilder.exec();
  }
}
