export interface Pie {
  type: 'pumpkin' | 'apple' | 'pecan';
  name: string;
  diameter: number;
}

export type Foo = string;

export type FooBar = {
    biz: string
}

export enum FizzBuzz {
    One,
    Two
}

// export type { NotUsedInterface as BestInterface } from './test-not-used'
export * from './test-not-used';
