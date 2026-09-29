import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { GetSchedulesDto } from './dto/get-schedules.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get()
  getSchedules(@Query() query: GetSchedulesDto) {
    return this.schedulesService.getSchedules(query);
  }
}
