import path from 'path';
import ts from 'typescript';

import type * as d from '../../declarations';
import {resolveType} from './transform-utils';

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
  console.log('adding ', typeName);
  const pathToTypeModule = getPathToTypeModule(type);
  console.log('path::', pathToTypeModule);

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
 * Helper function that, given a file containing interfaces to document, will
 * add all the types exported from that file to the type library.
 *
 * This will exclude any types that are marked 'private' via JSDoc.
 *
 * @param filePath the path to the file of interest
 */
export function addFileToLibrary(filePath: string): void {
  const program = ts.createProgram([filePath], {});
  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
    return;
  }

  ts.forEachChild(sourceFile, (node) => {
    if (isTypeDeclLike(node) && isExported(node) && isNotPrivate(node)) {
      const type = checker.getTypeAtLocation(node);

      if (type) {
        const typeName = node.name.getText();

        addToLibrary(type, typeName, checker);
      }
    } else if (ts.isExportDeclaration(node)) {
      // if there are named exports (like `export { Pie, Cake } from './dessert'`)
      // we get each export specifier (`Pie`, `Cake`), use the typechecker
      // to get it's type, figure out the name, and so on.
      if (ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((exportSpecifier) => {
          const type = checker.getTypeAtLocation(exportSpecifier);
          const name = exportSpecifier.name.getText();
          console.log('oh no! its a ', name);
          console.log(resolveType(checker, type));

          addToLibrary(type, name, checker);
        });
      } else {
        // if it's _not_ a named export clause then it's something like
        // `export * from 'foo'`, so we need to deal with all the symbols
        // exports from that module.
        checker.getExportsOfModule(checker.getSymbolAtLocation(node.moduleSpecifier)).forEach((exportedSymbol) => {
          const type = checker.getTypeAtLocation(exportedSymbol.valueDeclaration);
          const name = exportedSymbol.name;
          addToLibrary(type, name, checker);
        });
      }
    }
  });
}

/**
 * The 'type declaration like' syntax node types
 */
type TypeDeclLike = ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration;

/**
 * Check that a {@link ts.Node} is a type-declaration-like node. For our
 * purposes, this means that it is either an interface declaration, a type
 * alias, or an enum declaration.
 *
 * @param node a TypeScript syntax tree node
 * @returns whether or not this node is a type-declaration-like node
 */
function isTypeDeclLike(node: ts.Node): node is TypeDeclLike {
  return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node);
}

/**
 * Check if a {@link ts.Declaration} is exported.
 *
 * @param node a TypeScript syntax tree node
 * @returns whether or not this node is exported
 */
function isExported(node: TypeDeclLike): boolean {
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

/**
 * Check that a {@link ts.Declaration} is not marked as 'private' via JSDoc.
 *
 * @param node a TypeScript syntax tree node to check
 * @returns whether or not this node is marked as 'private'
 */
function isNotPrivate(node: TypeDeclLike): boolean {
  const jsDocTags = ts.getJSDocTags(node);

  return !jsDocTags.some((tag) => tag.tagName.text === 'private');
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
