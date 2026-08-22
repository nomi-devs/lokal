import { OpenAPIObject } from '@nestjs/swagger';

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;

interface OperationLike {
  tags?: string[];
}

// Splits one full OpenAPI document into a scoped copy containing only the
// operations tagged with one of `allowedTags` — used to serve separate
// Mobile / Dashboard Swagger UIs from a single set of controllers without
// duplicating or restructuring them (see swagger-tags.constants.ts).
export function filterDocumentByTags(
  document: OpenAPIObject,
  allowedTags: string[],
): OpenAPIObject {
  const filtered: OpenAPIObject = JSON.parse(
    JSON.stringify(document),
  ) as OpenAPIObject;

  for (const path of Object.keys(filtered.paths)) {
    const pathItem = filtered.paths[path] as Record<string, OperationLike>;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (
        operation &&
        !operation.tags?.some((tag) => allowedTags.includes(tag))
      ) {
        delete pathItem[method];
      }
    }

    const hasRemainingOperation = HTTP_METHODS.some(
      (method) => pathItem[method],
    );
    if (!hasRemainingOperation) {
      delete filtered.paths[path];
    }
  }

  if (filtered.tags) {
    filtered.tags = filtered.tags.filter((tag) =>
      allowedTags.includes(tag.name),
    );
  }

  return filtered;
}
