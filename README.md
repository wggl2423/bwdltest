# 波纹大陆

杨博文粉丝向 IP 展示页 —— 六国拼图，滑着看。

## 技术栈

- **框架**：Next.js 16.4.5（App Router）+ React 19 + TypeScript
- **样式**：纯 CSS（globals.css 设计 tokens + CSS Modules），不使用 Tailwind
- **交互**：所有交互组件标记 `"use client"`，滑动用 CSS scroll-snap
- **部署**：Vercel

## 功能概览

### 六国滑动卡片
- 横向 scroll-snap 卡片轮播，鼠标纵向滚轮映射横向滑动
- 仅「小人国」可进入，其余五国显示「惊喜待解锁」浮层
- 拼图外观用 `public/puzzle-frame*.png` 透明边框叠加

### 开场层（IntroOverlay）
- 唱片 CSS 绘制 + 同心纹路 + 中心孔
- 点击唱片播放背景音乐，输入名字后进入
- 波纹从按钮坐标径向扩散（800ms）
- `visitorName`、`introDone` 存 localStorage，支持「重看开场」

### 小人国（TinylandView）
- 桌面 900px 面板 / 移动全屏
- 5 个 tab：小人国介绍、团子介绍、泡泡探险队、爱在冬令时、你说我听
- 选中 tab 自动 `scrollIntoView` 滚入视区

| 板块 | 说明 |
|------|------|
| 小人国介绍 | 封面 + 标题 + 副标题 + 段落 + facts 列表 |
| 团子介绍 | 图片网格 + lightbox（上一张/下一张/关闭） |
| 泡泡探险队 | 条漫列表 + 阅读视图 |
| 爱在冬令时 | 外链跳转卡片（不内嵌商品） |
| 你说我听 | localStorage 留言（提交/删除/计数） |

## 项目结构

```
app/
  layout.tsx              # lang=zh-CN, title 波纹大陆
  page.tsx                # 主页面：intro 状态机 + 卡片点击分发
  globals.css             # 设计 tokens + reset + 纸张噪点 + reduced-motion 基线
  style-guide/            # 设计规范预览页
components/
  IntroOverlay.tsx        # 开场层 idle→playing→entering→done
  NationSlider.tsx        # 六国横向 scroll-snap 卡片
  TinylandView.tsx        # 小人国全屏面板 + tab 导航
  MysteryDialog.tsx       # 五国共用惊喜待解锁浮层
  IntroSection.tsx        # 小人国介绍
  TuanziSection.tsx       # 团子介绍（图片网格 + lightbox）
  BubbleSection.tsx       # 泡泡探险队（条漫列表 + 阅读）
  WinterSection.tsx       # 爱在冬令时（跳转卡片）
  ListenSection.tsx       # 你说我听（localStorage 留言）
  PlaceholderImage.tsx    # 图片加载失败显示纯色占位
  Icons.tsx               # 六国线性图标 + 锁图标
lib/
  data.ts                 # 所有 IP 内容集中在此，组件只读取不写死
public/
  puzzle-frame*.png       # 6 个方向的拼图边框 PNG
  audio/baiwuliaolai.mp3  # 开场背景音乐
```

## 数据驱动

所有 IP 内容集中在 `lib/data.ts`：

- `nations` — 六国基础数据（名称、标语、边框变体、是否可进入）
- `TINYLAND_TABS` — 小人国板块导航
- `FRAME_BY_VARIANT` — 拼图边框路径映射
- `WINTER_SELL_URL` — 爱在冬令时贩售外链
- `nationIntro` — 小人国介绍（标题、副标题、封面、段落、facts）
- `tuanziGallery` — 团子图片路径数组
- `comicIssues` — 条漫期数数据
- `MESSAGES_KEY` / `Message` — 留言存储键与类型

更新文案或图片只需修改 `lib/data.ts`，无需改动组件。

## 设计规范

- 主色：粉色系（`--pink-primary: #E8B4B8`、`--pink-deep: #D48A8F`、`--pink-soft: #F5E6E8`）
- 背景：`--bg: #FAF7F4`，中性克制不甜腻
- 圆角：`--radius-sm: 8px` / `--radius-md: 14px` / `--radius-lg: 20px`
- 全站唯一手写体 `--font-hand` 仅用于开场 wordmark
- 所有动画加 `prefers-reduced-motion` 降级
- 移动端触控热区 ≥ 44px

访问 `/style-guide` 查看色板、圆角、阴影、按钮、卡片示例。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。

## 构建与部署

```bash
npm run build      # 生产构建
npm run start      # 本地预览生产构建
```

### 部署到 Vercel

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. Framework Preset 选择 Next.js，构建命令自动识别
4. 无需额外环境变量

项目已包含 `vercel.json` 配置（安全响应头、区域设置）。

## 约束说明

- 不做考古、独立商城、登录、自建支付
- 「爱在冬令时」只做外链跳转
- 「你说我听」为纯前端 localStorage 原型，正式版需接入后端
- 文案不确定处用示例占位，正式上线前请替换 `lib/data.ts` 中内容
