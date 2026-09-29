import { IsIn, IsOptional } from 'class-validator';

export class GetFlightHoursSummaryDto {
  @IsOptional()
  @IsIn(['1w', '1m', '3m', '6m', '1y'])
  range?: string = '1w';
}
