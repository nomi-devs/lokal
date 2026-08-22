import { plainToClass, ClassConstructor } from 'class-transformer';
import { validateSync } from 'class-validator';

// Fails fast at boot (not silently at runtime) when required env vars are
// missing or the wrong shape — mirrors brocoders/nestjs-boilerplate's
// utils/validate-config.ts.
function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: ClassConstructor<T>,
): T {
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export default validateConfig;
