import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { AppClockService } from '../common/config/app-clock.service';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, AppClockService],
})
export class SchedulesModule {}
