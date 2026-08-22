import { Transform, TransformFnParams } from 'class-transformer';

// Base class every Mongoose schema extends so `_id` serializes to a plain
// string consistently across the app (mirrors brocoders/nestjs-boilerplate's
// utils/document-entity-helper.ts).
export class EntityDocumentHelper {
  @Transform(
    (params: TransformFnParams) => {
      if ('value' in params) {
        // https://github.com/typestack/class-transformer/issues/879
        const raw = (params.obj as Record<string, { toString(): string }>)[
          params.key
        ];
        return raw.toString();
      }

      return 'unknown value';
    },
    {
      toPlainOnly: true,
    },
  )
  public _id: string;
}
