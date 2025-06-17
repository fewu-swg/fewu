# CHANGELOG

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

* `Context.extend.Deployer` is moved to `Context.extend.Deployer`.

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

## REL2.0.0 - 2024-12-21

### Changes in features

#### Renamed optional features
* `markdown:markedExtras` renamed to `generator/allow-custom-marked-extension`.
* `markdown:noHeaderId` renamed to `generator/markdown-no-header-id`.
* `fewu/path/noSuffix` renamed to `path/no-md-suffix`.

#### New (functions in) optional features
* `generator/allow-custom-marked-extension` : Specific tricks for some marked extensions that does not follow the common usage. (like `marked-admonition-extension`)
* `generator/leave-no-h1` : Do not automatically add heading to posts.
* `generator/copy-next-image` : Get images referenced in post and put it into generated folder. (Only works with images next to post.md)

#### Removed optional features
* Remove feature `markdown:foreword/nullOnDefault`.
* Remove feature `markdown:foreword/warn`.
* Remove feature `fewu:path/autoRoot`, it's now a built-in fallback when `general.site-relative-root` is not configured (We recommend auto-configure, chich needs to fill `website.url` with website url (like `0xarch.github.io`)).

### Changes in interaction
The main entrance has rebuilt to be more flexible
* Rebuild `fewu --new` with human-friendly argument parser.
* Rebuild `fewu --init`.

### Utilities

#### New utilities
* `Argv`: Provides parsed program arguments. Replacing `gopt` in `#core/run`.
* `Console`: Replaces `info,info.red,warn` in `#core/run`
* `Markdown`: Provides a simple interface to interact with marked (or other parser may be added).
* `NewPromise`: Add some Promise features that are not supported in Node.js 20.
* `Text`: Replaces `#core/text_process`.
* `TemplateString`: Replaces `#core/gstring`. (Formerly `GString`, but with some tweaks)
* `GObject`: Moved out of `core`.
* `I18n`: Abstracted i18n utility.

### Code
* New `AbstractPost` class, which stores type declarations. (Do not use TypeScript)
* New `AbstractExposedApi` class.
* New `PostIdentifier` class, which replaces `Container` class.
* New `PostIdentifierCollection` class.
* Rebuild `Database`.
* Rebuild `Post`.
* `#core/builder` now uses `fs/promises`.
* use `${name}.html` instead of `${name}/index.html` for posts.
* Built-in module `search` now use formatted log.
* Fixed a bug that all files under post directory are recognized as a post file.

### Critical changes
* The old `database` or `db` API has been removed. Compatibility of `db.config` will be kept until 2.1.0.
* Use `split` `foreach` instead of `cycling` `varias` in working (as `cycling` and `varias` are hard to understand)
>> NOTE that `foreach` will be `each` in page template.
>> THIS IS UNSTABLE CHANGE.

## REL1.2.5 - 2024-11-18

### New
* Optional Features:
    * `fewu:path/local/noSuffix` : Fewu removes suffix in generated directries.
    * `markdown:markedExtras` : Allow user to dynamically load marked extensions module to fit their posts.

### Changed
* Rebuild search module.

### Fixed
* `fewu:path/flat` generates wrong path.

## REL1.2.4 - 2024-06-20

### New
* Optional Features:
    * `fewu:path/url/autoRoot` : Fewu automatically detects website root for file references.
    * `markdown:HTMLMinifier` : Fewu uses HTMLMinifier to reduce generated file size. (default before, manual now)
    * `markdown:noHeaderId` : Fewu will disable header id generation. (default before, manual now)
* Preature _Database_ API `db.$<>`
* Util `dynamicImport`

### Removed
* Deprecated API on _class_ `Post` : `Post<>.paths`.

### Changed
* Feature `fewu:path/flat` (before: `flatPath` ) now do: Flatten `read/yyyy/mm/dd/POST_NAME.md` to `read:yyyy-mm-dd:POST_NAME.md`.
* Builder will now ignore fail builds and log failure in console. (Behavior before: `throw` and STOP ).
* Section `site_url` in _Config_ moved to `website.URL` or `website.url`.

### Fixed
* Fixed incorrect file mode of most files (755 -> 644).
* Fixed some bugs in builtin modules

## REL1.2.3 - 2024-06-03

### New
* Easier construction for `FuzzyDate`.
* new "enabledFeatures[]" section in configuration, this will collect some separate config keys.
* flatPath is now a `Feature`, which need to enable manually. [**This has been removed since 1.2.4**]

### Fixed
* Fixed multi posts in one tag/category.
* Fixed unsorted posts in tag/category.

### Removed
* Removed `descriptive_class` , split `Tag` ... to separate files.

## REL1.2.2 - 2024-04-10
* `License` property `type` moved to public
* fix bug `License` could not use Creative Commons
* `PUBLIC_DIRECTORY` is now avaiable in modules (global mounted)
* fix bug in builtin module extra_files

## REL1.2.1 - 2024-04-01
* Removed `FEWU_INSIDER_VERSION`
* Changed Info format when skipping
* Update `processTemplate` with `async`

## REL1.2.0 n2.5.0 - 2024-04-01

### Fixed
* Fix bug that Reader could not sort ports correctly.

### Changed
* `text_process.js` now exports a default `TEXT` object.
* `GObject.deleteEscapingChar` is now moved to `text_process` as `TEXT.deleteEscapingCharacters`
* Update CONSTANT.OS_UNAME

### New
* Adjusted function names under `Layout` class
> The old functions are marked as deprecated and will be removed soon

* Adjusted function names in the `text_process.js`

* Update document: GString

* shell script `clean-workspace` and `run-test`
> `clean-workspace` will remove files created by fewu in current dir.
> `run-test` will mkdir fewu-test in $HOME,automatically download theme, create post and generate.

### CLI Parts
* **new** now supports tags, category and title as arguments in command line.

* **help** rewrited

### Beta Changes
> **WARN** that this is undone and do have many bugs !  
**These changes are usually compatible with last minor version, and the old will be removed after about 3 minor versions.**
Rename theme layout option name, and uses `GString` for string calculate.
`cycling` -> `use_split`
`varias` -> `use_foreach`
`option.cycling` -> `option.@split`
`option.varias` -> `option.@foreach`
> NOTE that option.@split and option.@foreach is invalid in JS. Here is used only for convenient.

the `to` uses `GString` format. And **older Template String format is compatible for a while**
> For GString, see document.

## REL1.1.1 n2.4.1 [BUGIFX] - 2024-03-30
* Fix bug which `GString` and `Collection` not imported
* Fix typo bug in built-in module extra-files
* Fix bug which Category and Tag contains `number[][]`

## REL1.1.0 n2.4.0 - 2024-03-30

### Fixed
* wrong comma in result from built-in module `rss`
> pesky ','
* Module Standards v1
> There are some changes in documents

### New
* New License type: Reprint (Experimental)
> **DISABLED** BY DEFAULT BECAUSE IT EXPOSES **DIFFERENT FUNCTIONS**
* The operation new post is now supported auto rename
* ES2023 porting
> Why do we need to write such old codes?

### Changed
* Post path is now calculated by file path, not title.
> It aims to fix some problems with the same title, through it's not very common.
> This might cause some trouble, be careful.
* Plugin now uses ESM
> Need to use '.mjs' extname.
* Custom modules needs to set suffix to '.mjs' for node to import
> Forgot to mention this in REL1.0.0
* Rewrite some codes
> "SOME"

### Removed
* Removed English documents(only Theme kept)
> Who needs those garbage?

### Deprecated
* `Post.path()` is removed. This property will be the same as `Post.paths.<Property>`, which will be renamed.

### PRE-Deprecated
These functions or properties will be removed in 1.2.0
New features will be available in 1.1.x
* `Post<>.old` will be removed. Use `!!Post<>.property?.old` instead.
* `Post<>.ECMA262Date` will be removed. This it not necessary.
* `License.is_cc_license` (renamed: `License.isCreativeCommons`)
* `Post<>.isTopped` (renamed: `Post<>.top`)
* `Post<>.datz` (renamed: `Post<>.fuzzyDate`)

## REL1.0.0 n2.3.2 - 2024-03-28
Release.
**RENAME** Fewu is now the project name!

### Fixed
* Could not load modules when developing fewu.

## 2.3.1 [FAKE-BUMP] - 2024-03-28
This is a fake version for fix critical bugs in 2.3.0

## s1.0.X+11(n2.3.0-0+325) - 2024-03-24

### Critical Changes
* `database` section `theme` has now changed to be an object with `config`(before `db.theme`) `dirs`(before `db.dirs.theme`) `name` `variables`(before `db.theme[default]`)
* Theme's configuration file has now changed a lot. See documentation.
* Nexo source code is now moved to _src

### Update docs
* [u] BID
* [u] Theme

### Changed
* Move all built-in assets into `_assets` directory

### New
* Support for quickly start a post, run `npm run new` in terminal you'll get a new .md in the `posts` directory.
* Support for terminal **IMPORTANT**, you can run `npm link` then use `fewu` in your terminal for all functions! *NOTE THAT* you can also use `npm run` and so on when you cloned `fewu`

### Fixed
* `gopt` got wrong arguments

## b1.0.4(n2.2.6-0) [QUICK PASSED] - 2024-03-22

### Changed
* `Map` is going to be used as the default data type of `site.categories`, `site.tags` and `ID`, while now Nexo provides an `IDMap` export that is experimental
* `Post` now has a new property `parsed` for storing parsed content/foreword

### New
* `html-minifier` is used to compress html file
* a bridge file is used for import structures and class

### Update docs
* BID
* Theme

## b1.0.3-3(n2.2.5-4) - 2024-03-20

### Changed
* `GObject.mix` is now recursive.
* FULL support of `GString`
* alias class from `descriptive_class` to `struct`
* moved `src/modules` directory to `_modules`

### New
* you can now customize the foreword when a post has no foreword.
* node imports alias (`#core` `#db` `#struct`)
* docs for **Module Standards v1**

### Announced
* The first stable version will be s1.0.0, as the beta version b1.1.0, and fewu version n2.3.0

## b1.0.3-2(n2.2.5-2) - 2024-03-19

### Changed
* config.json is now generated automatically by init module
* rerecongized codes
* `i18n` is merged into **Core**
* `init` is merged into **Core**
* `extra_files` separated as a module named `extra_files`
* some part codes in app.js is divided as part.js

### New
* `GString` class (struct) (Experimental,WIP)
* advanced module support is now experimental
* **Module Standards v1**

### Fixed
* wrong order in `site.categories` and `site.tags`
* `init` overrides files

### Removed
* `lib/mod.js` (moved to `core/run`)
* `lib/class.post.js` (`Post` moved to `core/descriptive_class`)

## b1.0.3-1(n2.2.5-1) - 2024-03-12

### Changed
* `CODE[0]` is now `FED`
* {`Tag`,`Category`}.included_article is now renamed to included

### New
* structure tree, better organizing
* `init` module completed (call using `npm run init`)
* `text_process.js` for processing text *haha
* `descriptive_class.js` for descriptive class like `Category` `Tag` `License` `Datz`
* i18n fallback file support (`i18n.default.json`)

### Removed
* `classes.js` (GARBAGE)
* `file_class.js` (GARBAGE)

## b1.0.3(n2.2.4-3) - 2024-03-12

### Changed

* pre sorted for posts
* flatter builtin icon
* `Datz.compareWith` now can be used as a `compareFn` (strongly not recommend to use `Datz.compareWith` outside `Array.sort` unless you know what you are exactly doing!)
* BID now starts with `1`
* `CONSTANTS` now can be read as constant.

### Fixed

* Unexpected error while scanning objects without `option` attribute in layout section.

## b1.0.2(n2.2.4-2) - 2024-03-12

The same as 2.2.4-2 , this is a bump tag where version-rel and version-fewu separated.

## 2.2.4-2 - 2024-03-08

### Removed

* old codes

### New

* `builder` section in database
* `NULL_OBJECT` function to create an object that it's prototype = null

## 2.2.4-1 - 2024-03-08

### Fixed

* i18n number matching bug

## 2.2.4 - 2024-03-08

### New
* Automatically adds H1 tag in post

## 2.2.3-2 - 2024-03-04

### New

* build mode for theme to better organize (release/devel)

### Fixed

* whitespace in (parsed) post title
* `undefined` and too much whitespace in searchStrings.json

## 2.2.3-1 - 2024-03-04

### Changed

* encoded string for path now (not id as before, * might change sometime)
* `fewu.logo` back to function, and removes multiple stylesheets
* `Post.paths.[website/local]` for static call
* operation only update theme will not read post now

### Preview

* `code` and `node` section in `core/constants`

## 2.2.3 [SEARCH-UPDATE] - 2024-03-02

### Changed

* Removed `by` section in `searchStrings.json` to increase search speed.

## 2.2.2 [DEVELOPER-UPDATE] [CRITICAL-UPDATE] - 2024-03-01

### New

* basic database for storing
* widely using of `GObject`

### REMOVED **

* **CRITICAL** OLD API (v1) SUPPORT

## 2.2.0 [BUMP] - 2024-03-01

### New

* `core/run` (gopt support)
* `CONSTANTS` now merged in Provision
* `core/reader` (rename `lib/post`)
* new design for default `Arch` theme

### Changed

* rename `SITEMAP` to lower case `sitemap`
* move `PostSortingFunction` to class `Post` as a static method.

### Removed

* `lib/post` (renamed as `core/reader`)
* `modules/classes` (deprecated GARBAGE code)
* `modules/filesys` (deprecated GARBAGE code)
* `modules/hug` (deprecated GARBAGE code, replaced by `core/run`)
* `modules/-r-/v2` (deprecated, unimportant, unused feature)

## 2.1.2 - 2024-02-27

### New

* `used_tags` and `used_categories` in `site` for tag/category name as array

## 2.1.1-1 - 2024-02-27

### Fixed

* wrong cycling times

## 2.1.1 - 2024-02-27

### Fixed

* '~' bug
* wrong tags

### New

* last modified date support

## 2.1.0 - 2024-02-27

### Removed

* **CRITICAL** GARBAGE CODE build pages
* `Configuration` class (use `Collection` instead)

### New

* `Collection` class
* `Layout` class
* `Cache` class (replace `Cachable`)
* `Correspond` (struct) class
* `GObject` (unused, for developing)

### Changed

* short path is now default
* renamed functions in sitemap module
* get_property now supports array as the second argument

### Fixed

* update rss module for new feature
* update sitemap module for new feature

### Planned

* [x] use new `Collection` for all functions and remove old codes [ 2.2.3]
* [x] move old builder to new place [ 2.2.3]

### Prepared

* constants for short code (unused)
* config template for init and auto using (unused)

## 2.0.3-3 - 2024-02-26

### New

* **EXPERIMENTAL** short path (exShortPath)

## 2.0.3-2 - 2024-02-26

### New

* `property` property for Post class to store post info that not as default (e.g. highlight)

### Fixed

* wrong sort order

## 2.0.3-1 - 2024-02-26

### New

* `path` function for Post class (`websitePath`=>`path('website')`,`publicFilePath`=>`path('local')`)

### Changed

* app: better performance for API collector
* sitemap: fixed priority

### Removed

* app: garbage API(from v1) in v2

## 2.0.3 - 2024-02-25

### Changed

* CRITICAL foreword is now a separate part as description [Wsince 2.0.1]
* CRITICAL-THEME use copy.@posts instead of rawPosts.copy{,to}, see the default Arch theme.

### New

* Foreword length check (25 ~ 200)
* `Cachable` class for storing results.

### Other

* Cleared CHANGLOG.md

## 2.0.2-4 - 2024-02-25

### New

* new `i18n` function (compatible with older for now)
* new function to get parsed content(foreword,...) of post(compatible with older for now)

## 2.0.2-3 - 2024-02-24

### Changed

* `v=>v!=''` closure as `notFake`

### New

* `warn` function
* basic post keyword support

## 2.0.2-2 - 2024-02-24

### Changed

* update README.md

## 2.0.2-1 - 2024-02-24

### Changed

* use encodeURI for sitemap generation(txt, xml)

### Fixed

* white background of fewu logo
* 9001 error

### Planned

* remove deprecated codes
* cleaner renderer
* API v3

## 2.0.2 - 2024-02-16

### Removed

* sortArticle in Provision V2

### Changed

* rename sources to resources
* removed useless console.log

### Features

* [since 2.0.1] Sitemap(Xml) support
* [since 2.0.1, continuing] Page description support
* [since 2.0.1, experimental, working] RSS support

### Known bugs

* Error during parsing EJS template ERROR "Could not find the include file" [Marked as deprecated]

## 2.0.1 - 2024-02-16

### Features
* Sitemap(txt) support
* [Theme] PUG support
* Word counting for posts
* Category & Tag

### Fixed Bugs
* No Nexo Bug [Since 0.0.-1]

### Deprecated Functions
* Hug (With bugs, and no actual meaning) use LibMod now.
* Hail(Low performance) use native fs now.
