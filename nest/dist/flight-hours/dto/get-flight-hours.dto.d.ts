import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsIsoDateConstraint implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class GetFlightHoursDto {
    from: string;
    to: string;
}
