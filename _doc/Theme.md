# Document: Theme

A Fewu Theme is similar to a Hexo Theme. Here's [example](//github.com/fewu-swg/fewu-theme-next);

## Structure

A working theme requires the following 4 folders in root directory:

* `languages`: The [translation](#translations) files are put here.

* `layout`: The template files are put here. Important.

* `scripts`: Your theme-side plugin scripts are put here.

* `source`: The assets e.g. CSS and JS are put here.

## Helpers

There are some built-in Hexo-style helpers that you can [use directly in your template](#templates).
```ts
declare interface Helpers {
    __(text: string): string;
    url_for(path: string): string;
    full_url_for(path: string): string;
    css(param0: string | object | string[] | object[]): string;
    js(param0: string | object | string[] | object[]): string;
    _container_of(type: 'categories' | 'tags', current: number): PageContainer & {current: number, total: number};
    _dir_of(type: 'public' | 'source' | 'cwd'): string;
    moment: typeof moment;
    [key: string]: Function;
}
```

* `__`: This functions provides you the ability to flexibly inject different text for different pages. It was originally designed for I18n functionalities, for usage detail, see [Translations](#translations) below;

* `url_for`: Converts the given path to URL path. If you provide a `string` starts with `/`, simply returns itself. Otherwise, `Context.config.root` & `string` will be joined together.

* `full_url_for`: Converts the given path to absolute URL path (e.g. https://example.com/foo/bar). `Context.config.url` & `string` will be joined together.

* `_container_of`: Used in archive pages, where parameter1 should always be `page.current`. `return.current`: index of archive key `return.key`, `return.total`: total splited count of archive key `return.key`.

* `_dir_of`: Returns the directory defined in `Context`. Only use this for getting current working directory. You can use `ctx.PUBLIC_DIRECORY` and `ctx.SOURCE_DIRECTORY`.

* `css`: Converts the given list to HTML `link` list.

* `js`: Converts the given list to HTML `script` list. Note this doesn't add `type=module` attribute. You may want to override this.

* `moment`: Exported from moment.js.

## Templates

This is the core of theme. 

### How Fewu use template

When deploying, Fewu will traverse the `layout` directory. For each files, it's filename without extname will be used to determine whether this file should be used to render specific template.

e.g. A file named `index.pug` in `layout` directory will be found, and it's name `index` matches the built-in page type `index`, so it will be used to render `index` page.

When rendering a post, it's different. All posts have a `layout` property (defaults to `default`), and the filename (without extname) matches `post.${post.layout}` will be used. Which means posts without layout specified in front-matter will always use file `post.default.<extname>` as it's template.

### Page variables

There a two variable you can always get in your template: `ctx` and `page`

#### `ctx: BasicContext`

You can get most information which a complete template required in this variable. See `abstract-types` package to get full definition of `BasicContext`.

#### `page: Page`

This variable stores data that related to the page itself than global. See [Page](./Page.md);

### Page helpers

Like page variables, but page helpers are functions you can use in your template.

See [Helpers](#helpers);

## Translations

A correct translation profile is also a YAML file. The `key: value` syntax, which means `key` is the raw text in your template, `value` is the text in correspond language.

### Using in template

You can use the `__` helper to get the text that macthes the page's language (if you defined in your translation profiles). Simply put the `key` in parameter0. If no correspond translation profile found, it will return the key itself.

### Extending

You may want to inset numbers in the key, that's supported.

Use `{NUMBER}` placeholder to mark. The `key` and `value` should have same counts of the `{NUMBER}` placeholder.

Example: Translation profile includes `"{NUMBER} rawtext": "translated {NUMBER} text"`, and `__("8 rawtext")` will be translated into `"translated 8 text"`.