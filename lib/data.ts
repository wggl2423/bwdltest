// ===== 波纹大陆数据中心 =====
// 所有 IP 内容集中在此，组件只读取不写死。
// 下方文案为示例占位，正式上线前请替换为真实内容。
export type FrameVariant =
  | "north"
  | "east"
  | "south"
  | "west"
  | "northWest"
  | "southEast";

// 拼图边框 PNG 路径映射。6 个变体对应旋钮位置，不旋转避免裁切。
export const FRAME_BY_VARIANT: Record<FrameVariant, string> = {
  north: "/puzzle-frame.png",
  east: "/puzzle-frame-east.png",
  south: "/puzzle-frame-south.png",
  west: "/puzzle-frame-west.png",
  northWest: "/puzzle-frame-northwest.png",
  southEast: "/puzzle-frame-southeast.png",
};

export type Nation = {
  id: string;
  name: string;
  tagline: string;
  frameVariant: FrameVariant;
  enterable: boolean; // 只有小人国为 true
};

export const nations: Nation[] = [
  {
    id: "tinyland",
    name: "小人国",
    tagline: "波纹的小小世界",
    frameVariant: "north",
    enterable: true,
  },
  {
    id: "food",
    name: "食物一国",
    tagline: "美味正在筹备",
    frameVariant: "east",
    enterable: false,
  },
  {
    id: "eleven",
    name: "十一国",
    tagline: "即将开启",
    frameVariant: "south",
    enterable: false,
  },
  {
    id: "bo",
    name: "啵国",
    tagline: "敬请期待",
    frameVariant: "west",
    enterable: false,
  },
  {
    id: "children",
    name: "六一国",
    tagline: "童心未泯",
    frameVariant: "northWest",
    enterable: false,
  },
  {
    id: "mystery",
    name: "待解锁",
    tagline: "神秘预告",
    frameVariant: "southEast",
    enterable: false,
  },
];

// ===== 小人国板块导航 =====
// 新增板块时在此追加，TinylandView 自动渲染对应 tab。
export type TinylandTabId = "intro" | "tuanzi" | "bubble" | "winter" | "listen";

export const TINYLAND_TABS: { id: TinylandTabId; label: string }[] = [
  { id: "intro", label: "小人国介绍" },
  { id: "tuanzi", label: "团子介绍" },
  { id: "bubble", label: "泡泡探险队" },
  { id: "winter", label: "爱在冬令时" },
  { id: "listen", label: "你说我听" },
];

// ===== 爱在冬令时 =====
// 仅做外链跳转，不内嵌商品。替换为实际贩售链接即可。
export const WINTER_SELL_URL = "#";

// ===== 小人国介绍 =====
// 更新文案 / 封面直接改这个对象，不需要改组件。
export type NationIntro = {
  title: string;
  subtitle: string;
  cover: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
};

export const nationIntro: NationIntro = {
  title: "小人国",
  subtitle: "欢迎来到小人国",
  cover: "/tinyland/cover.jpg",
  paragraphs: [
    "这里是小人国，波纹大陆的第一站。每一位到访的旅人都能在这里找到属于自己的小小角落。",
    "我们用拼图记录每一个值得珍藏的瞬间，欢迎你来探索、留言、留下属于你的波纹。",
  ],
  facts: [
    { label: "代表色", value: "柔粉" },
    { label: "更新频率", value: "每周更新" },
  ],
};

// ===== 团子介绍图片 =====
// 原型阶段为占位路径；后续直接替换数组里的路径即可更新图片。
export const tuanziGallery: string[] = [
  "/tuanzi/placeholder-1.jpg",
  "/tuanzi/placeholder-2.jpg",
  "/tuanzi/placeholder-3.jpg",
  "/tuanzi/placeholder-4.jpg",
  "/tuanzi/placeholder-5.jpg",
  "/tuanzi/placeholder-6.jpg",
  "/tuanzi/placeholder-7.jpg",
  "/tuanzi/placeholder-8.jpg",
  "/tuanzi/placeholder-9.jpg",
];

// ===== 泡泡探险队条漫 =====
// 每周更新时在数组头部插入新一期即可，无需改动组件。
export type ComicIssue = {
  id: number;
  week: string;
  title: string;
  pages: string[];
};

export const comicIssues: ComicIssue[] = [
  {
    id: 1,
    week: "第 1 周",
    title: "第一期条漫标题",
    pages: ["/comics/issue1-1.jpg", "/comics/issue1-2.jpg"],
  },
  {
    id: 2,
    week: "第 2 周",
    title: "第二期条漫标题",
    pages: ["/comics/issue2-1.jpg"],
  },
];

// ===== 你说我听留言 =====
// 原型阶段用 localStorage 存储，正式版需接入后端或表单服务。
export type Message = {
  id: string;
  name: string;
  content: string;
  createdAt: number;
};

export const MESSAGES_KEY = "messages";
