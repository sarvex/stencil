import { mockModule } from '@stencil/core/testing';
import ts from 'typescript';

import type * as d from '../../../declarations';
import { updateStyleImports } from '../style-imports';

describe('style-imports', () => {
  describe('updateStyleImports', () => {
    describe('ESM-style imports', () => {
      const stencilImport = `import { Component, Prop, h } from '@stencil/core';`;
      let transformOptions: d.TransformOptions;
      let sourceFile: ts.SourceFile;
      let moduleFile: d.Module;

      beforeEach(() => {
        transformOptions = {
          componentExport: null,
          componentMetadata: null,
          coreImportPath: '@stencil/core',
          currentDirectory: '/',
          module: 'esm',
          proxy: null,
          style: 'static',
          styleImportData: 'queryparams',
        };

        const sourceText = `
${stencilImport}
export class MyComponent {
  constructor() {
  }
  render() {
    return h("div", null,
      "Hello, World! I'm Stencil");
  }
  static get is() { return "my-component"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "ios": ["accordion.ios.scss"],
    "md": ["accordion.md.scss"]
  }; }
  static get styleUrls() { return {
    "ios": ["accordion.ios.css"],
    "md": ["accordion.md.css"]
  }; }
}
        `;

        sourceFile = ts.createSourceFile(
          'my-component.tsx',
          sourceText,
          ts.ScriptTarget.ESNext,
          true,
          ts.ScriptKind.TSX
        );

        // @ts-ignore
        moduleFile = mockModule({
          cmps: [
            // @ts-ignore
            {
              tagName: 'my-component',
              componentClassName: 'MyComponent',
              encapsulation: 'shadow',
              styles: [
                {
                  modeName: 'ios',
                  styleId: 'MY-COMPONENT#ios',
                  styleStr: null,
                  styleIdentifier: 'myComponentIosStyle',
                  externalStyles: [
                    {
                      absolutePath: '/components/my-component/accordion.ios.scss',
                      relativePath: 'accordion.ios.scss',
                      originalComponentPath: 'accordion.ios.scss',
                    },
                  ],
                },
                {
                  modeName: 'md',
                  styleId: 'MY-COMPONENT#md',
                  styleStr: null,
                  styleIdentifier: 'myComponentMdStyle',
                  externalStyles: [
                    {
                      absolutePath: '/components/my-component/accordion.md.scss',
                      relativePath: 'accordion.md.scss',
                      originalComponentPath: 'accordion.md.scss',
                    },
                  ],
                },
              ],
              jsFilePath: '/components/my-component/my-component.js',
              sourceFilePath: '/components/my-component/my-component.tsx',
              hasRenderFn: true,
              hasStyle: true,
            },
          ],
        });
      });

      it("adds imports for a component's external styles", () => {
        const updatedSource = updateStyleImports(transformOptions, sourceFile, moduleFile);
        const createdImports = updatedSource.statements.filter((stmt): stmt is ts.ImportDeclaration =>
          ts.isImportDeclaration(stmt)
        );
        // .map((importDeclaration) => importDeclaration.importClause.getTex())
        // .filter((importText) => importText !== stencilImport);
        expect(createdImports.length).toBe(3);

        const iosImport = createdImports[1];
        expect(iosImport.importClause?.name.text).toBe('myComponentIosStyle');
        // TODO(NOW): always a substring, always any, clean this up
        expect((iosImport.moduleSpecifier as any).text).toMatch(
          '/components/my-component/accordion.ios.scss?tag=my-component&mode=ios&encapsulation=shadow'
        );

        const mdImport = createdImports[2];
        expect(mdImport.importClause?.name.text).toBe('myComponentMdStyle');
        // TODO(NOW): always a substring, always any, clean this up
        expect((mdImport.moduleSpecifier as any).text).toMatch(
          '/components/my-component/accordion.md.scss?tag=my-component&mode=md&encapsulation=shadow'
        );
      });
    });
  });
});
