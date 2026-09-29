import { Module } from '@nestjs/common';
import { PilotController } from './pilot.controller';
import { PilotService } from './pilot.service';
import { AppClockService } from '../common/config/app-clock.service';

@Module({
  controllers: [PilotController],
  providers: [PilotService, AppClockService],
})
export class PilotModule {}
