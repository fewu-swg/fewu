# Document: Page

Last updated: 2025/05/12 10:56 +08:00

## TS Declaration

```typescript
declare interface Page {
    id?: string;
    title?: string;
    author?: string;
    language: string;
    date?: moment.Moment;
    updated?: moment.Moment;
    length?: number;
    excerpt?: string;
    more?: string; // deprecated
    properties?: { [key: string]: string };
    layout?: string;
    comments?: boolean;
    content?: string;
    prev?: Page;
    next?: Page;
    current: number;
    total: number;
    raw?: string;
    raw_excerpt?: string;
    source: string;
    full_source: string;
    path: string;
    relative_path: string;
    stat?: fs.Stats;
}
```

## Explanation

### `page.id`

Get the id of the current page.

### `page.title`

Get the title of the current page.

### `page.author`

Get the author of the current page. Defaults to `ctx.config.author`.

### `page.language`

Get the language of the current page.

### `page.date`

Get the original date of the current page.

### `page.updated`

Get the last updated date of the current page.

### `page.length`

Get the length of the current page. Defaults to the word count of the current page.

### `page.excerpt`

Get the excerpt of the current page. This is typically a short summary or preview of the page content. It is often used in listings or previews to give readers a quick overview of the page.

### `page.more`

This property is deprecated. It was previously used to store additional content.

### `page.properties`

Get custom properties of the current page. These are key-value pairs defined in the page's front matter.

### `page.layout`

Get the layout used by the current page.

### `page.comments`

Determine if comments are enabled for the current page.

### `page.content`

Get the full content of the current page.

### `page.prev`

Get the previous page in the sequence, if available.

### `page.next`

Get the next page in the sequence, if available.

### `page.current`

Get the current page number in a paginated sequence.

### `page.total`

Get the total number of pages in a paginated sequence.

### `page.raw`

Get the raw content of the current page (before processing).

### `page.raw_excerpt`

Get the raw excerpt of the current page (before processing).

### `page.source`

Get the source file path of the current page.

### `page.full_source`

Get the full source file path of the current page.

### `page.path`

Get the URL path of the current page.

### `page.relative_path`

Get the relative file path of the current page.

### `page.stat`

Get the file statistics of the current page, if available. See documentation of Node's `fs.Stats`.

## Experimental Features

There are some unstable properties in `Page` that may change any time. Use at your own risk.

* `build_relative_path: UPath`
* `build_absolute_path: UPath`
* `source_relative_path: UPath`
* `source_absolute_path: UPath`
* `web_relative_path: UPath`
* `web_absolute_path: UPath`
