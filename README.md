## 多页面构建开发阶段按需启动

```shell
## 支持全部编译
npm run dev
## 支持按需编译，只编译包含「list」关键字的chunk
npm run dev -p=list
## 支持按需编译，可用简易缩写
npm run dev list
## 支持配置多个关键字
npm run dev -p=list,detail
```