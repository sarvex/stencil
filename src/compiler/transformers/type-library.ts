import path from 'path';
import ts from 'typescript';

import type * as d from '../../declarations';

/**
 * This is a {@link d.JsonDocsTypeLibrary} cache which is used to store a
 * record of all the types referenced by components which are 'seen' during a
 * Stencil build
 */
const TYPE_LIBRARY: d.JsonDocsTypeLibrary = {};

/**
 * Add a type reference to the library if it has not already been added. This
 * function then returns the unique identifier for that type so a reference to
 * it can be stored.
 *
 * @param type the type we want to add
 * @param typeName the type's name
 * @param checker a {@link ts.TypeChecker} instance
 * @returns the unique ID for the type in question
 */
export function addToLibrary(type: ts.Type, typeName: string, checker: ts.TypeChecker): string {
  const pathToTypeModule = getPathToTypeModule(type);

  // for now we don't make any attempt to include types in node_modules
  if (pathToTypeModule.startsWith('node_modules')) {
    return '';
  }

  const id = getTypeId(pathToTypeModule, typeName);

  if (!(id in TYPE_LIBRARY) && !type.isTypeParameter()) {
    const declaration = getTypeDeclaration(type);

    if (declaration !== '') {
      TYPE_LIBRARY[id] = {
        declaration,
        docstring: getTypeDocstring(type, checker),
        path: pathToTypeModule,
      };
    }
  }

  return id;
}

/**
 * This returns a reference to the cached {@link d.JsonDocsTypeLibrary} which
 * lives in this module.
 *
 * @returns a reference to the type library
 */
export function getTypeLibrary(): d.JsonDocsTypeLibrary {
  return TYPE_LIBRARY;
}

/**
 * Get a string representation of the original declaration for a
 * {@link ts.Type} object.
 *
 * @param type the type of interest
 * @returns a string containing the original declaration for that type
 */
function getTypeDeclaration(type: ts.Type): string {
  return type?.symbol?.declarations?.[0]?.getText() ?? '';
}

/**
 * Get docstring for a given type. Returns an empty string if no docstring is
 * present.
 *
 * @param type the type in question
 * @param checker a {@link ts.TypeChecker} instance
 * @returns the type's docstring if present, else an empty string
 */
function getTypeDocstring(type: ts.Type, checker: ts.TypeChecker): string {
  const symbol = type?.symbol;

  return symbol ? ts.displayPartsToString(symbol.getDocumentationComment(checker)) : '';
}

/**
 * Get the unique ID for a type which was referenced somewhere within a Stencil project.
 *
 * We define a unique ID as the following string:
 *
 * ```ts
 * `${pathToTypeModule}::${typeName}`
 * ```
 *
 * where `pathToTypeModule` is the path to the type's home module and
 * `typeName` is the type's original name.
 *
 * The idea is that this defines an unambiguous identifier for types across a
 * Stencil project, so we can track the locations from which a given type is
 * referenced.
 *
 * @param pathToTypeModule the path to the home module for the type
 * @param typeName the type's name
 * @returns a formatted type ID
 */
const getTypeId = (pathToTypeModule: string, typeName: string): string => {
  return `${pathToTypeModule}::${typeName}`;
};

/**
 * Get the filepath to the module in which a type was originally declared.
 *
 * @param type a {@link ts.Type} object
 * @returns a filepath to that types home module
 */
function getPathToTypeModule(type: ts.Type): string {
  const pathType = type?.symbol?.declarations?.[0].getSourceFile().fileName ?? '';

  if (pathType === '') {
    // TODO can this happen?
    return process.cwd();
  } else {
    return path.relative(process.cwd(), pathType).replace(/^\.\//, '');
  }
}
