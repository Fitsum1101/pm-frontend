import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodSchema } from 'zod';

// Minimal React Hook Form resolver for Zod — avoids pulling in an extra
// dependency for the few forms this app has.
export function zodResolver<T extends FieldValues>(schema: ZodSchema<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors: errors as never };
  };
}
