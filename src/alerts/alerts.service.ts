import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './schemas/alert.schema';
import { GetAlertsFilterDto } from './dto/get-alerts-filter.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
  ) {}

  async findAll(filter: GetAlertsFilterDto): Promise<Alert[]> {
    const query: any = {};

    if (filter.serverId) {
      query.serverId = filter.serverId;
    }
    if (filter.jobName) {
      query.jobName = filter.jobName;
    }
    if (filter.severity) {
      query.severity = filter.severity;
    }
    if (filter.acknowledged !== undefined) {
      query.acknowledged = filter.acknowledged;
    }

    return this.alertModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(filter.skip ?? 0)
      .limit(filter.limit ?? 100)
      .exec();
  }

  async acknowledge(id: string): Promise<Alert> {
    const alert = await this.alertModel.findByIdAndUpdate(
      id,
      { acknowledged: true },
      { new: true },
    );

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    return alert;
  }
}
