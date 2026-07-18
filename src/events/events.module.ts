import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Execution, ExecutionSchema } from './schemas/execution.schema';
import { Alert, AlertSchema } from '../alerts/schemas/alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Execution.name, schema: ExecutionSchema },
      { name: Alert.name, schema: AlertSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
