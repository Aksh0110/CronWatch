import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';
import { Execution, ExecutionSchema } from '../events/schemas/execution.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: Execution.name, schema: ExecutionSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
