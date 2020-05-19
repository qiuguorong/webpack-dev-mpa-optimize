## 多页面构建开发阶段按需启动

```shell
## 支持全部编译
npm run dev
## 支持按需编译，只编译包含「list」关键字的chunk
npm run dev -p=keyword
## 支持按需编译，可用简易缩写
npm run dev keyword
## 支持配置多个关键字
npm run dev -p=keyword1,keyword2
```

## 核心功能
在`build/dev-server-demand.js`中，根据关键字匹配`webpack chunk`，并修改`entry`与`plugin`，代码不侵入`webpack.dev.conf.js`配置文件