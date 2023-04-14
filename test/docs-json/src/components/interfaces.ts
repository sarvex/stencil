/**
 * Interface that should be included
 */
export interface Pie {
  type: 'pumpkin' | 'apple' | 'pecan';
  name: string;
  diameter: number;
}

/**
 * Type that should be included
 *
 */
export type FooBar = {
  biz: string;
};

/**
 * Enum that should be included
 */
export enum FizzBuzz {
  One,
  Two,
  Three,
}

// re-export w/ alias and `export type`, should be under original name in `docs.json`
export type { ReExportedUnderNewNameWithType as BestInterface } from './test-not-used';
// re-export w/ alias, should be under original name in `docs.json`
export { ReExportedUnderNewName as BetterInterface } from './test-not-used';
// re-export w/ `export type`
export type { ReExportedWithType } from './test-not-used';
// re-export
export { ReExported } from './test-not-used';

export * from './test-not-used';
