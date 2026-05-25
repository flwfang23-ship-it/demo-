# 项目入口

这是小程序SaaS营销平台的客户管理后台H5 Demo。纯HTML+CSS+JS，无构建工具，浏览器直接打开 `h5-demo/index.html` 即可预览。

## 代码定位

改代码前，先读 **`h5-demo/CODE_MAP.md`**，按模块名（C01~C06）定位文件和函数。

## 项目结构

- `h5-demo/` — H5演示代码（主工作区）
- `H5demo流程/` — 分批建设过程文档和缓存记录

## 页面加载机制

index.html 是主壳（侧边栏+顶栏+内容区），页面通过 XHR 加载 `pages/{page}.html` 注入 `#pageContent`，然后调用 `window.onPageLoaded(page)` 分发初始化。

## 视口

PC端管理后台，最小宽度1200px，左侧侧边栏+右侧内容区。
