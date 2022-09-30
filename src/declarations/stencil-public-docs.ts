/**
 * A container for JSDoc metadata for a project
 */
export interface JsonDocs {
  /**
   * The metadata for the JSDocs for each component in a Stencil project
   */
  components: JsonDocsComponent[];
  /**
   * The timestamp at which the metadata was generated, in the format YYYY-MM-DDThh:mm:ss
   */
  timestamp: string;
  compiler: {
    /**
     * The name of the compiler that generated the metadata
     */
    name: string;
    /**
     * The version of the Stencil compiler that generated the metadata
     */
    version: string;
    /**
     * The version of TypeScript that was used to generate the metadata
     */
    typescriptVersion: string;
  };
}

/**
 * Container for JSDoc metadata for a single Stencil component
 */
export interface JsonDocsComponent {
  /**
   * The directory containing the Stencil component, minus the file name.
   *
   * @example /workspaces/stencil-project/src/components/my-component
   */
  dirPath?: string;
  /**
   * The name of the file containing the Stencil component, with no path
   *
   * @example my-component.tsx
   */
  fileName?: string;
  /**
   * The full path of the file containing the Stencil component
   *
   * @example /workspaces/stencil-project/src/components/my-component/my-component.tsx
   */
  filePath?: string;
  /**
   * The path to the component's `readme.md` file, including the filename
   *
   * @example /workspaces/stencil-project/src/components/my-component/readme.md
   */
  readmePath?: string;
  /**
   * The path to the component's `usage` directory
   *
   * @example /workspaces/stencil-project/src/components/my-component/usage/
   */
  usagesDir?: string;
  /**
   * The encapsulation strategy for a component
   */
  encapsulation: 'shadow' | 'scoped' | 'none';
  /**
   * The tag name for the component, for use in HTML
   */
  tag: string;
  /**
   * The contents of a component's `readme.md` that are user generated.
   *
   * Auto-generated contents are not stored in this reference.
   */
  readme: string;
  /**
   * The description of a Stencil component, found in the JSDoc that sits above the component's declaration
   */
  docs: string;
  /**
   * JSDoc tags found in the JSDoc comment written atop a component's declaration
   */
  docsTags: JsonDocsTag[];
  /**
   * The text from the class-level JSDoc for a Stencil component, if present.
   */
  overview?: string;
  /**
   * A mapping of usage example file names to their contents for the component.
   */
  usage: JsonDocsUsage;
  /**
   * Array of metadata for a component's `@Prop`s
   */
  props: JsonDocsProp[];
  /**
   * Array of metadata for a component's `@Method`s
   */
  methods: JsonDocsMethod[];
  /**
   * Array of metadata for a component's `@Event`s
   */
  events: JsonDocsEvent[];
  /**
   * Array of metadata for a component's `@Listen` handlers
   */
  listeners: JsonDocsListener[];
  /**
   * Array of metadata for a component's CSS styling information
   */
  styles: JsonDocsStyle[];
  /**
   * Array of component Slot information, generated from `@slot` tags
   */
  slots: JsonDocsSlot[];
  /**
   * Array of component Parts information, generate from `@part` tags
   */
  parts: JsonDocsPart[];
  /**
   * Array of metadata describing where the current component is used
   */
  dependents: string[];
  /**
   * Array of metadata listing the components which are used in current component
   */
  dependencies: string[];
  /**
   * Describes a tree of components coupling
   */
  dependencyGraph: JsonDocsDependencyGraph;
  /**
   * A deprecation reason/description found following a `@deprecated` tag
   */
  deprecation?: string;
}

export interface JsonDocsDependencyGraph {
  [tagName: string]: string[];
}

/**
 * A descriptor for a single JSDoc tag found in a block comment
 */
export interface JsonDocsTag {
  /**
   * The tag name (immediately following the '@')
   */
  name: string;
  /**
   * The description that immediately follows the tag name
   */
  text?: string;
}

/**
 *
 */
export interface JsonDocsValue {
  /**
   *
   */
  value?: string;
  /**
   *
   */
  type: string;
}

/**
 * A mapping of file names to their contents.
 *
 * This type is meant to be used when reading one or more usage markdown files associated with a component. For the
 * given directory structure:
 * ```
 * src/components/my-component
 * ├── my-component.tsx
 * └── usage
 *     ├── bar.md
 *     └── foo.md
 * ```
 * an instance of this type would include the name of the markdown file, mapped to its contents:
 * ```ts
 * {
 *   'bar': STRING_CONTENTS_OF_BAR.MD
 *   'foo': STRING_CONTENTS_OF_FOO.MD
 * }
 * ```
 */
export interface JsonDocsUsage {
  [key: string]: string;
}

/**
 *
 */
export interface JsonDocsProp {
  /**
   *
   */
  name: string;
  /**
   * the type of the prop, in terms of the TypeScript type system (as opposed to JavaScript's or HTML's)
   */
  type: string;
  /**
   * `true` if the prop was configured as "mutable" where it was declared, `false` otherwise
   */
  mutable: boolean;
  /**
   * The name of the attribute that is exposed to configure a compiled web component
   */
  attr?: string;
  /**
   * `true` if the prop was configured to "reflect" back to HTML where it (the prop) was declared, `false` otherwise
   */
  reflectToAttr: boolean;
  /**
   * the JSDoc description text associated with the prop
   */
  docs: string;
  /**
   * JSDoc tags associated with the prop
   */
  docsTags: JsonDocsTag[];
  /**
   * The default value of the prop
   */
  default: string;
  /**
   * Deprecation text associated with the prop. This is the text that immediately follows a `@deprecated` tag
   */
  deprecation?: string;
  /**
   *
   */
  values: JsonDocsValue[];
  /**
   * `true` if a component is declared with a '?', `false` otherwise
   *
   * @example
   * ```tsx
   * @Prop() componentProps?: any;
   * ```
   */
  optional: boolean;
  /**
   * `true` if a component is declared with a '!', `false` otherwise
   *
   * @example
   * ```tsx
   * @Prop() componentProps!: any;
   * ```
   */
  required: boolean;
}

export interface JsonDocsMethod {
  name: string;
  docs: string;
  docsTags: JsonDocsTag[];
  deprecation?: string;
  signature: string;
  returns: JsonDocsMethodReturn;
  parameters: JsonDocMethodParameter[];
}

export interface JsonDocsMethodReturn {
  type: string;
  docs: string;
}

export interface JsonDocMethodParameter {
  name: string;
  type: string;
  docs: string;
}

export interface JsonDocsEvent {
  event: string;
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  docs: string;
  docsTags: JsonDocsTag[];
  deprecation?: string;
  detail: string;
}

export interface JsonDocsStyle {
  name: string;
  docs: string;
  annotation: string;
}

export interface JsonDocsListener {
  event: string;
  target?: string;
  capture: boolean;
  passive: boolean;
}

/**
 * A descriptor for a slot
 *
 * Objects of this type are translated from the JSDoc tag, `@slot`
 */
export interface JsonDocsSlot {
  /**
   * The name of the slot. Defaults to an empty string for an unnamed slot.
   */
  name: string;
  /**
   * A textual description of the slot.
   */
  docs: string;
}

/**
 * A descriptor of a CSS Shadow Part
 *
 * Objects of this type are translated from the JSDoc tag, `@part`, or the 'part'
 * attribute on a component in TSX
 */
export interface JsonDocsPart {
  /**
   * The name of the Shadow part
   */
  name: string;
  /**
   * A textual description of the Shadow part.
   */
  docs: string;
}

export interface StyleDoc {
  name: string;
  docs: string;
  annotation: 'prop';
}
