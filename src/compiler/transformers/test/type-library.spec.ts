import { CompilerCtx } from '@stencil/core/declarations';
import { mockCompilerCtx, mockValidatedConfig } from '@stencil/core/testing';
import path from 'path';
import { addToLibrary, getTypeLibrary } from '../type-library';
import ts from 'typescript';

import { patchTypescript } from '../../sys/typescript/typescript-sys';
import { getAllTypeReferences } from '../transform-utils';

function resetLibrary() {
  const library = getTypeLibrary();

  for (const key in library) {
    delete library[key];
  }
}

async function setup() {
  const compilerContext: CompilerCtx = mockCompilerCtx();
  // TODO need the config or no?
  const config = mockValidatedConfig({
    rootDir: path.resolve("."),
  });

  patchTypescript(config, compilerContext.fs);

  // we need to have files in the `inMemoryFs` which TypeScript
  // can resolve, otherwise it won't find the module!
  // const dessertModulePath = path.join(config.rootDir, 'src/dessert.ts');
  const dessertModulePath = 'src/dessert.ts';
  await compilerContext.fs.writeFile(
    dessertModulePath,
    `export interface Pie {
  type: 'pumpkin' | 'apple' | 'pecan';
  diameter: number;
}`
  );

  // const mealModulePath = path.join(config.rootDir, 'src/meal.ts');
  const mealModulePath = 'src/meal.ts';
  await compilerContext.fs.writeFile(
    mealModulePath,
    `import { Pie } from './dessert';

    export function prepareMeal(pie: Pie) {
      eat(pie);
    }

    function eat(pie: Pie) {
      console.log('I ate it');
    }`,
  );

  const options = {
    ...ts.getDefaultCompilerOptions(),
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    rootDir: 'src/',
    baseUrl: '.',
  };

  const program = ts.createProgram(['src/meal.ts'], {
    ...options,
  }, ts.createCompilerHost(options));

  console.log('SOURCE FILES::', program.getSourceFiles().length)

  const checker = program.getTypeChecker();
  const mealModule = program.getSourceFile(mealModulePath);
  console.log(mealModule);
  return { program, checker, mealModule };
}

describe('type library', () => {
  afterEach(() => {
    resetLibrary();
  });

  it('should be able to add a type to the library', async () => {
    const { checker, mealModule } = await setup();
    const referencedtypes = getAllTypeReferences(checker, mealModule);
    referencedtypes.forEach(({ name, type }) => {
      addToLibrary(type, name, checker);
    });
  });
});
