import { CompilerCtx } from '@stencil/core/declarations';
import { mockCompilerCtx, mockValidatedConfig } from '@stencil/core/testing';
import path from 'path';
import { addToLibrary, getTypeLibrary } from '../type-library';
import ts from 'typescript';

import { patchTypescript } from '../../sys/typescript/typescript-sys';

function resetLibrary() {
  const library = getTypeLibrary();

  for (const key in library) {
    delete library[key];
  }
}

async function setup() {
  const compilerContext: CompilerCtx = mockCompilerCtx();
  // TODO need the config or no?
  const config = mockValidatedConfig();

  patchTypescript(config, compilerContext.fs);

  // we need to have files in the `inMemoryFs` which TypeScript
  // can resolve, otherwise it won't find the module!
  await compilerContext.fs.writeFile(
    path.join(config.rootDir, 'src/dessert.ts'),
    `export interface Pie {
  type: 'pumpkin' | 'apple' | 'pecan';
  diameter: number;
}`
  );
  await compilerContext.fs.writeFile(
    path.join(config.rootDir, 'src/meal.ts'),
    `export function prepareMeal (pie: Pie) {
      eat(pie);
    }

    function eat(pie: Pie) {
      console.log('I ate it');
    }`
  );

  const program = ts.createProgram(['src/dessert.ts'], {});
  const checker = program.getTypeChecker();
}

describe('type library', () => {
  beforeEach(() => {
    resetLibrary();
  });

  it('should be able to add a type to the library', () => {});
});
