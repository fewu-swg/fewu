# Fewu

## LICENSE

版权所有 (C) 2020-2026 0xarch(soloev) 
本程序为自由软件：你可以依据自由软件基金会所发布的第三版或更高版本的GNU通用公共许可证重新发布、修改本程序。

虽然基于使用目的而发布本程序，但不负任何担保责任，亦不包含适销性或特定目标之适用性的暗示性担保。详见GNU通用公共许可证。

你应该已经收到一份附随此程序的GNU通用公共许可证副本。否则，请参阅 <http://www.gnu.org/licenses/>。

All rights reserved (C) 2020-2026 0xarch(Soloev)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

## Overview

`Fewu` is automatic static blog site generator. It's designed as fixed, time-saving, random-less, which means the same configuration should have the same result everywhere.

## Using

### Dependencies
* node.js >= 16 (If you need hot-reloading for articles, node.js >= 20)
* npm or pnpm
> `pnpm` is officially supported, every feature related to local packages will be only tested on pnpm.

### Deploying

1. Download CLI tool

```sh
pnpm install fewu-cli
```

2. Generate initial workspace

```sh
pnpm fewu init
```
> Usually you only have to run this command once. Running repeatedly is not fully tested but should have no bad effect.

3. (Optional) Write a post

```sh
pnpm fewu new
```

4. Generate website

```sh
pnpm fewu
```
> If a generated page is completely same as previous, it will skip IO.

5. You site is on `public` (default output directory)

#### Advanced options

If you encounter issues that the program stuck at startup, or some plugins are not detected, you may try add argument `--experimental-npm`, which calls `npm` directly to get all packages.

Fewu has a built-in live server but not enabled by default. you can add argument `--server` to enable this feature. Once enabled, it will force the public directory to temp file directory (e.g. `/tmp` in linux), and after deployment, a server will be setup and you can view your website in `localhost:3000` (default port).

**Hot-reloading** for **posts/articles and theme layout & theme resource** is supported. It will automatically enable/disable regarding on whether the runtime supports file watching. By default, for Node.js it's first version supporting this feature is Node.js 20

## Configuration
Modify `config.yaml`.

Multiple configuration is supported by specifying which configuration will be used in current deploy by console argument `--config $CONFIG_FILE`.

## Develop your theme

See [Theme Document](/_doc/Theme.md)。

## Contribution & Hacking

For maintaining issues, any PR will not be merged, you can open an issue if you want some new features or you found bugs.

Note that almost all things can be done with theme scripting (For example, the default theme adds a permalink with title feature by modifying data in theme scripts), so features that is achievable by outside scripting might not be considered. 

However you can fork this repository and add features in your own.

## [!NOTE]

*   GitHub Releases is no longer used after REL3.2.2 (Jan 6, 2025) because it's functionality is almost a partial duplicate of npm. You should download from [npm](//npmjs.com) if you want executable things, and it resolves dependencies.

*   Package `fewu` (without scoping) has been deprecated for about 1 year. The final update it received is 3.7.81 (with notice patch). Last stable update it received is 3.3.4. You should switch to `fewu-cli` for CLI, or `@fewu-swg/fewu` for the core functions.
