import { IsNotEmpty, IsString, Matches, CustomValidator, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';

@ValidatorConstraint({ name: 'isIsoDate', async: false })
export class IsIsoDateConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const date = new Date(text);
    return !isNaN(date.getTime()) && date.toISOString().startsWith(text);
  }
  defaultMessage(args: ValidationArguments) {
    return 'from must be a valid ISO date (YYYY-MM-DD)';
  }
}

export class GetFlightHoursDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be a valid ISO date (YYYY-MM-DD)' })
  @Validate(IsIsoDateConstraint, { message: 'from must be a valid ISO date (YYYY-MM-DD)' })
  from!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be a valid ISO date (YYYY-MM-DD)' })
  @Validate(IsIsoDateConstraint, { message: 'to must be a valid ISO date (YYYY-MM-DD)' })
  to!: string;
}
