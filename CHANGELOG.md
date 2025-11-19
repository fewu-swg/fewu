# CHANGELOG

## REL3.7.3 - 2025-11-19

* Add exit codes for debugging.

* Theme resolver will now try to catch errors while loading external script.

### REL3.7.2 - 2025-11-18

* Bugfix

## REL3.7.1 - 2025-11-18

* Add experimental `UPath` API for better Cross-platform capability.
> The `UPath` API belongs to `fewu-utils` and is under heavy development, any breaking changes can be made.

## REL3.7.0 - 2025-11-05

* Add Local Manager to auto watch new files and add permalink.

* Fix newline problem in post.

## REL3.6.1 - 2025-06-25

* Construct `Context` in `App` function. Remove `ctx` export.

## REL3.6.0 - 2025-06-24

### IMPORTANTS

* `Sass` deployer is separated to `@fewu-swg/fewu-deployer-sass`.

* Rewrite `Deployer` and `Renderer`.

* (Partial) Remove compat for old style plugins.

* Plugins should export a `deployers: __Deployer[]`.

* Expose `load` event.

### COMPATIBILITIES

* Remove monitor for deployer.

### UTIL CHANGE

* Add more types to `abstract-types`.

* `Context.extend.Renderer` is moved to `Context.Renderer`.

* `Context.extend.Deployer` is moved to `Context.Deployer`.

## REL3.5.2 - 2025-06-17

* Add monitor for deployer.

* Remove unused `#module`.

## REL3.5.1 - 2025-06-17

* Fix bug that custom plugins cannot be loaded.

* Add compat for old style plugins.

## REL3.5.0 - 2025-06-17

### IMPORTANTS

* `Context` now extends `AsyncEventEmitter` that supports async events.

* `Context.plugin` is renamed to `Context.extend`.

* Experimental support for plugin system. See document at [Document: Plugin](./_doc/Plugin.md).

* Port server, logger, collector to plugin.

* `Context.Renderer` is moved to `Context.extend.Renderer`.

* `Context.Deployer` is moved to `Context.extend.Deployer`.

### UTIL CHANGES

* Unused Function Removal: `#util/I18n` `#util/StandaloneApp` (Deprecated).

* Unused Function Removal: `#util/Console` `#util/Text` `#util/Argv` `#util/dynamicImport` `#util/NewPromise` `#util/NodeModules` (Replaced by `@fewu-swg/fewu-utils`).

* New Util: `AsyncEventEmitter` at `#util/AsyncEmitter`.

### MISCS

* Experimental Dev Feature: Use `typescript/native-preview`(`tsgo`) to compile code.

* Fix typo in default config.

* Move types to `@fewu-swg/abstract-types`.

* Bugfix: Version detector causes error in Node.js < 20.11.0

* Feature: Automatically disable live change in server mode when `fs.watch` with `recursively` is not supported in current platform.


## REL3.4.18 - 2025-05-20

* Move all private properties signed by TypeScript's `private` key to ECMA's `#` marker.

* Port `GObject` to TypeScript.

* Support post order.

* Bug fixes.

## REL3.4.17 - 2025-05-16

* Support post preview-on-write in live server.

* Remove default dependency `fewu-renderer-markdown`.

## REL3.4.16 - 2025-05-14

* Fix bug that `NodeModules` could not handle scoped packages correctly.

* Pnpm support.

* Plugin-driving server.

## REL3.4.15 - 2025-05-13

* Experimental support for pnpm.

## REL3.4.14 - 2025-05-12

Merged with REL3.4.13, REL3.4.12

* Support Array-style tag/category declaration.
>e.g. in YAML
> tags:
>   - Tag1
>   - Tag2

* Removed untouchable imports in `package.json`.

* Removed common files build. Move to `fewu-cli`.

* Removed unused imports in `tsconfig.json`.

* Removed built-in Pug renderer. Use `@fewu-swg/fewu-renderer-markdown` instead. This package should be depended by themes which uses pug as markup language.

* Support npm packaged theme. NOTE npm package got high priority than traditional theme.

## REL3.4.11 - 2025-05-12

* Dropped all v2 codes and dists since they are not referenced.

* Dropped deprecated feature `#util/Markdown`, replaced by `@fewu-swg/fewu-renderer-markdown`.

* `TemplateString` is now moved to TypeScript (mts).

* `TemplateString` now uses `GObject.getProperty` rather than deprecated `Collection`.

* Fix bug that `Renderer` not initialized properly.

* `Deployer` now uses `Renderer` from `Context` rather than standalone import.

## REL3.4.10 - 2025-05-12

* Use `os.tmpdir()` to determine which directory should be used to generate content when in server mode.

* Fix bug that `page.excerpt` is not renderered.

* New _non-standard_ API in `Page`: `page.raw_excerpt`: Get raw excerpt content.

* Add document for `Page`.

## REL3.4.9 - 2025-05-11

3.4.4 is jumped due to a mistake.

Merged with REL3.4.8, REL3.4.7, REL3.4.6, REL3.4.5, REL3.4.3, REL3.4.2, REL3.4.1, REL3.4.0

* Use `os.EOL` instead of single `\n` to avoid error in `\r\n` systems.

* Fix bug that `renderer` not use dynamicImport.

* Removed deprecated document.

* Fix type error in `renderer`.

* Fix bug that dynamicImport causes error on NT platform.

* Fix bug that renderer still requires deprecated `fewu-renderer-markdown`.

* Fix bug that `Theme` script import causes error.

* Remove `bin` directory in dist files.

* Fix bug that URS cannot import modules even if it's detected.

* The core package `@fewu-swg/fewu` now does not export a executable `fewu`. Use `fewu-cli` instead. See [Fewu Cli](//github.com/fewu-swg/fewu-cli).

* Fix bug that renderer requires `abstract-types`.

* Remove old files in `_dist`.

## REL3.3.4 - 2025-05-11

* Move the repository to @fewu-swg.
* Move npm path from `fewu` to `@fewu-swg/fewu`.
* Remove `#util-ts` (deprecated).
* Experimental unified renderer system in use.
* TS Compiler now skips library check.
* New `NodeMoudules` util to query local modules (global now implemented).

## REL3.2.3 - 2025-01-10

* Fix a bug that changing JS file causes error in server mode.

* Add some pre-defined error classes.

* Support external source deployers (less, etc.) (Needs manual enabling).

* Remove `afterGenerate` `beforeGenerate`.

* Support `config.json`, `config.yaml`, `config.yml`, `_config.yaml`, `_config.yml` as configuration file name.

## REL3.2.2 - 2025-01-06

* Fix a bug that `PageDeployer` throws an Error `ENOENT` and not re-render page in server mode.

* Fix a bug that `PostDeployer` not render related page when layout changed in server mode.

* Add log for enter server.

* Fix a bug that `Console` inserts a whitespace before customized text unexpectedly.

* Re-balanced log colors.

## REL3.2.1 - 2025-01-05

Switch `Marked` to `Markdown it`. 

Split out Markdown renderer module. See [fewu-renderer-markdown](https://github.com/0xarch/fewu-renderer-markdown/)

## REL3.2.0 - 2025-01-05

Add Live Server support. While use `fewu --server <port=3000>` to call `fewu`, it will open a server in `<port>`. Server will watch the changes in `theme/<name>/`, and rerender files when it is nessary.

When use this feature on non-win32 platforms, it will write file to `/tmp/io.fewu.server/` instead of `public_dir` configured in config.yaml to reduce file operations.

## REL3.1.0 - 2025-01-03

Add compiler for `Sass` files. The `sass` file in themes' `source` folder will be compiled into `css`.

`Renderer` now supports `EventEmitter`.

`Deployer`, `Renderer`, `ObjectParser` now can be accessed through `Context`.

## REL3.0.1 - 2025-01-02

Fix a bug where `SourceDeployer` causes error when `public` directory is not existed at start.

## REL3.0.0 - 2025-01-02

### CRITICAL CHANGES

All codes (except some utilities) are re-written. Compatibility for version REL2.0.0 is still kept, but will remove in further versions.

#### Utilities

* Argv(MTS)
* Console(MTS)
* fn/dynamicImport(MJS)
* ExtendedFS(MTS)
* GObject(MJS)
* I18n(Deprecated,used in v2,MJS)
* Markdown(Deprecated, used in v2,MJS)
* NewPromise(Deprecated, used in v2,MTS)
* StandaloneApp(Deprecated, used in v2,MTS)
* TemplateString(Deprecated, used in v2,MJS)
* Text(MTS)

#### Renderers

* Markdown(Builtin,MTS)
* Pug(Builtin,MTS)

#### Object Parsers

* JSON(Builtin,MTS)
* Yaml(Builtin,MTS)

#### Helpers

* __: I18n support helper
* url_for: URL helper
* full_url_for: URL helper
* css: HTML helper
* js: HTML helper
* \_container\_of: Logic helper
* \_dir\_of: Logic helper
* moment: Logic helper

## DEV2.0.99 - 2024-12-27

TypeScript & (Partial) Hexo compatibility.