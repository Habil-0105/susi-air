import { Module } from '@nestjs/common';
import { FlightHoursController } from './flight-hours.controller';
import { FlightHoursService } from './flight-hours.service';
import { AppClockService } from '../common/config/app-clock.service';

@Module({
  controllers: [FlightHoursController],
  providers: [FlightHoursService, AppClockService],
})
export class FlightHoursModule {}
