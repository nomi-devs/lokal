import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'CompareAtGreaterThanPrice', async: false })
class CompareAtGreaterThanPriceConstraint implements ValidatorConstraintInterface {
  validate(compareAtPrice: number, args: ValidationArguments): boolean {
    if (compareAtPrice === undefined) return true;
    const object = args.object as { price?: number };
    if (object.price === undefined) return true;
    return compareAtPrice > object.price;
  }

  defaultMessage(): string {
    return 'compareAtPrice must be greater than price';
  }
}

// Only usable where `price` is present on the same DTO (i.e. create, not a
// partial update — updates re-check this in the service against the merged
// DB record instead, since a PATCH may omit price).
export function CompareAtGreaterThanPrice(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: CompareAtGreaterThanPriceConstraint,
    });
  };
}
