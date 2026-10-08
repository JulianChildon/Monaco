# 摩纳哥亲王宫 — 中文单页介绍站

无需构建工具和依赖的静态单页网站，用于介绍摩纳哥亲王宫的历史、建筑与艺术。

## 本地预览

Open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 页面结构

- 宫殿概览
- 历史沿革
- 建筑与空间
- 壁画艺术
- 修复与保护
- 今日的亲王宫
- 参观须知

新增正文目前均为带用途说明的中文占位文本。网站不包含票价、购票入口、预约流程、新闻、FAQ 或联系表单。

页面包含响应式布局、滚动淡入和首屏轻微视差。图片使用 `url.txt` 中的自定义域名链接加载；中文字体仍从 `assets/fonts/` 本地加载。`assets/images/` 保留图片备份。

图片链接现已统一为 HTTPS，适用于通过 HTTPS 发布的网站。

## GitHub Pages 部署

1. 将整个项目提交到 GitHub 仓库，务必包含 `assets/`、`.nojekyll`、`index.html`、`styles.css` 和 `script.js`。
2. 在仓库的 **Settings → Pages** 中，将 Source 设为 **Deploy from a branch**。
3. 选择 `main` 分支和 `/ (root)` 目录后保存。
4. 等待 GitHub Pages 发布完成，访问其生成的网址。

CSS 中的字体使用 `./assets/fonts/...` 相对路径，图片使用绝对链接，因此网站发布在项目子路径下也能正确引用这些资源。图片能否显示取决于图片服务器的公开访问权限及网络连通性。
