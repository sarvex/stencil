import { Component, h, Method } from '@stencil/core';
import {importedInterface, ImportedInterface} from './imported-interface';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  /**
   * Returns a promise that resolves when the toast did dismiss.
   */
  @Method()
  onDidDismiss<T = any>(): Promise<ImportedInterface<T>> {
    return importedInterface();
  }

  render() {
    return <div>Hello, World! I'm a mess</div>
  }
}
