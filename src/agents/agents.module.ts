import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { Agent, AgentSchema } from './schemas/agent.schema';
import { Alert, AlertSchema } from '../alerts/schemas/alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: Alert.name, schema: AlertSchema },
    ]),
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService, MongooseModule],
})
export class AgentsModule {}
