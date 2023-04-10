/**
 * Some JSDoc here describing something or other
 *
 * It's multi-line, etc.
 */
export interface ImportedInterface<T> {
  test: "boop"
}

export async function importedInterface<T>(): Promise<ImportedInterface<T>> {
  return {
    test: "boop"
  }
}
