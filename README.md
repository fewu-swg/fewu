# Fewu

## LICENSE

版权所有 (C) 2020-2026 0xarch(soloev) 
本程序为自由软件：你可以依据自由软件基金会所发布的第三版或更高版本的GNU通用公共许可证重新发布、修改本程序。

虽然基于使用目的而发布本程序，但不负任何担保责任，亦不包含适销性或特定目标之适用性的暗示性担保。详见GNU通用公共许可证。

你应该已经收到一份附随此程序的GNU通用公共许可证副本。否则，请参阅 <http://www.gnu.org/licenses/>。

Allrights reserved (C) 2020-2026 0xarch(Soloev)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

## Overview

`Fewu` is automatic static blog site generator. It's designed as fixed, time-saving, randomless, which means the same configuration should have to same result everywhere.

## Using

### Dependencies
* node.js >= 16 (If you need hot-reloading for articles, node.js >= 20)
* pnpm
> `pnpm` is offically supported, every feature related to local pacakges will be only tested on pnpm.

### Deploying

1. Download fewu-cli
```sh
pnpm install fewu-cli
```

2. Generate initial workspace
```sh
pnpm fewu init
```
> Usually, you only have to run this command once. Running repeatedly is not fully tested but should have no bad effect.

3. (Optional) Write a post
```sh
pnpm fewu new
```

4. Generate website
```sh
pnpm fewu
```
> If a genearted page is completely same as previous, it will skip IO.

5. You site is on `public` (default output directory)

## Configuration
Modify `config.yaml`.

Multiple configuration is supported by specifying which configuration will be used in current deploy by console argument `--config $CONFIG_FILE`.

## Develop your theme

See [Theme Document](/_doc/Theme.md)。

## Code Hack

You can fork this repository or just modifying codes in `node_modules` (not recommended)

## Contribution

Issue or PR is welcome.

> Be patient with codes.
