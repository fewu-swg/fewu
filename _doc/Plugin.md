# Document: Plugin

A plugin is an object with callable `.constructor` (e.g. `class`), and it's return value has the following properties:
* [`.exports`](#property-exports): [`ExportsType`](#type-exportstype)
* [`.assigner`](#property-assigner): `(ctx: BasicContext) => void`
* [`.__fewu_plugin_name`](#property-__fewu_plugin_name): `string`
* [`.__fewu_is_plugin`](#property-__fewu_is_plugin): `boolean = true`

## Properties

### Property `.exports` 

An object which includes exported things like a Renderer, or a Parser. This value will be used at startup after construction.

### Property `.assigner`

A function. Commonly used for registering events. This function will be called at startup after construction.

### Property `.__fewu_plugin_name`

Optional. The value will be printed at startup. Defaults to the package's name.

### Property `.__fewu_is_plugin`

For Identification. Any object with `.__fewu_is_plugin` strictly equals to `true` will be treated as a plugin.

## Types declaration

### Type `Plugin` 
```ts
declare class Plugin {
    __fewu_plugin_name: string;
    __fewu_is_plugin = true;
    exports: defaultExportsType = {
        renderers: [],
        parsers: [],
    };
    assigner: (ctx: BasicContext) => void;
}
```

### Type `ExportsType`
```ts
declare interface defaultExportsType {
    renderers: __Renderer[],
    parsers: __Parser[],
    [key: string]: any
}
```

For `__Renderer` and `__Parser`, see source code.