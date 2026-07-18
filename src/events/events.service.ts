import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Execution, ExecutionDocument } from './schemas/execution.schema';
import { Alert, AlertDocument } from '../alerts/schemas/alert.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { GetExecutionsFilterDto } from './dto/get-executions-filter.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Execution.name) private executionModel: Model<ExecutionDocument>,
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
  ) {}

  async create(dto: CreateEventDto): Promise<Execution> {
    const started = new Date(dto.startedAt);
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
      await this.alertModel.create({
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
      query.jobName = filter.jobName;
    }
    if (filter.status) {
      query.status = filter.status;
    }

    return this.executionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(filter.skip ?? 0)
      .limit(filter.limit ?? 100)
      .exec();
  }
}
