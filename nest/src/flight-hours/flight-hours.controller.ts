import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service';
import { GetFlightHoursDto } from './dto/get-flight-hours.dto';
import { GetFlightHoursSummaryDto } from './dto/get-flight-hours-summary.dto';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get()
  getFlightHours(@Query() query: GetFlightHoursDto) {
    return this.flightHoursService.getFlightHours(query);
  }

  @Get('summary')
  getSummary(@Query() query: GetFlightHoursSummaryDto) {
    return this.flightHoursService.getSummary(query);
  }

  @Get('limits')
  getLimits() {
    return this.flightHoursService.getLimits();
  }
}
