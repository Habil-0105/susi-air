import { Injectable } from '@nestjs/common';

@Injectable()
export class AppClockService {
  today(): string {
    return process.env.APP_TODAY || '2026-05-15';
  }
}
