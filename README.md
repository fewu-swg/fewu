# 这是一个归档分支

此分支储存了 Fewu 2.*.* 时期的代码，此分支的代码没有在最新版本进行测试，仅供参考使用。

README.md：说明文件。  

版权所有 (C) 2020-2024 0xarch(soloev) 
本程序为自由软件：你可以依据自由软件基金会所发布的第三版或更高版本的GNU通用公共许可证重新发布、修改本程序。

虽然基于使用目的而发布本程序，但不负任何担保责任，亦不包含适销性或特定目标之适用性的暗示性担保。详见GNU通用公共许可证。

你应该已经收到一份附随此程序的GNU通用公共许可证副本。否则，请参阅 <http://www.gnu.org/licenses/>。

# Fewu

`Fewu` 是一个自动化静态博客生成器。Fewu 被设计为固定的、快速的、无随机性的。这意味着使用同一份配置文件在任何地方都应得到相同结果。

## 使用 Fewu

### 依赖
* node.js (带有 --experimental-strip-types 支持)
* npm
* Linux 发行版

### 部署

1. 下载 fewu-cli
```sh
npm install fewu -g
```

2. 自动生成需要的目录和文件。
```sh
fewu --init
```
> 通常这个命令只需要运行一次。你也可以重复运行。是否会破坏数据取决于 Node.js 的内部实现。在 Arch Linux 上的测试结果表明多次运行此命令并无明显影响。

3. [可选] 写一篇博客
```sh
fewu --new
```
> 这个命令会在 `posts` 目录下生成一个 {{Y}}{{m}}{{d}}-new.md 的 Markdown 文档。
> 如果目录下已经有了，则会生成 {{Y}}{{m}}{{d}}-new-{{JUMP_NUMBER}}.md

4. 生成发布版网站
```sh
fewu
# The same as
# fewu --config config.json --release
```
> `fewu` 本身是对 `fewu --config config.json --release` 的简写。

> Fewu 在写入网页的时候会首先将已有的网页文件内容与生成的内容比对。如果内容相同，则不会继续写入文件。

5. 你的网站已经在 `public` 目录可用了！

## 修改配置
请修改 `config.json`。  
如果你有多个配置文件，可以在运行`fewu`时使用`--config $CONFIG_FILE`手动制定

## 开发主题

请参阅 [主题文档](/_doc/Theme.md)。

## Code Hack

请 fork 此仓库。

## 作出贡献

你可以发起 Issue ，或提交 Pull Request 来为 Fewu 作出贡献。我们非常重视你的意见。
> 耐心。