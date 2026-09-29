import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppClockService } from './common/config/app-clock.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppClockService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
