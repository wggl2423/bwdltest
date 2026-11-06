// 像素画图标：内联 SVG，shape-rendering="crispEdges" 禁止抗锯齿
// 颜色仅限 --pink-deep / --pink-primary / --surface / --text

type PixelIconType =
  | "sheep"
  | "cup"
  | "rabbit"
  | "planet"
  | "star"
  | "question";

type PixelIconProps = {
  type: PixelIconType;
  size?: number;
};

// 16x16 像素网格：. = 透明, d = --pink-deep, p = --pink-primary, w = --surface, t = --text
const PATTERNS: Record<PixelIconType, string[]> = {
  // 羊：头部 + 两只角
  sheep: [
    "................",
    "..d..........d..",
    ".dd..........dd.",
    "..d..........d..",
    "...wwwwwwwwww...",
    "..wwwwwwwwwwww..",
    ".wwtwwwwwwwwtww.",
    ".wwwwwwwwwwwwww.",
    ".wwwwwwwwwwwwww.",
    ".wwwwddddddwwww.",
    "..wwwwwwwwwwww..",
    "...wwwwwwwwww...",
    "....d......d....",
    "....d......d....",
    "...dd......dd...",
    "................",
  ],
  // 水杯：杯身 + 吸管
  cup: [
    "................",
    ".......dd.......",
    ".......dd.......",
    ".......dd.......",
    "..wwwwwwwwwwww..",
    ".wwppppppppppww.",
    ".wpwwwwwwwwwwpw.",
    ".wpwttttttttwpw.",
    ".wpwttttttttwpw.",
    ".wpwttttttttwpw.",
    ".wpwttttttttwpw.",
    ".wpwttttttttwpw.",
    ".wppppppppppppw.",
    "..wddddddddddw..",
    "..wwwwwwwwwwww..",
    "................",
  ],
  // 兔子：长耳朵 + 圆脸
  rabbit: [
    "................",
    "...dd......dd...",
    "...dp......pd...",
    "...dp......pd...",
    "...dp......pd...",
    "...dp......pd...",
    "..ddppddddppdd..",
    ".dppppwwwwppppd.",
    ".dppwwwwwwwwppd.",
    ".dpwwttwwttwwpd.",
    ".dpwwwwwwwwwwpd.",
    ".dpwwwtwwtwwwpd.",
    ".dppwwwwwwwwppd.",
    "..dppppppppppd..",
    "...dddddddddd...",
    "................",
  ],
  // 星球：圆 + 环
  planet: [
    "................",
    "......dddd......",
    "....ddppppdd....",
    "...dppwwwwppd...",
    "..dppwwwwwwppd..",
    ".dppwwttttwwppd.",
    ".dpwwttwwttwwpd.",
    "dddddddddddddddd",
    "dddddddddddddddd",
    ".dpwwttwwttwwpd.",
    ".dppwwttttwwppd.",
    "..dppwwwwwwppd..",
    "...dppwwwwppd...",
    "....ddppppdd....",
    "......dddd......",
    "................",
  ],
  // 星星
  star: [
    "................",
    ".......dd.......",
    ".......dp.......",
    ".......dp.......",
    "..d....dp....d..",
    "..dd...dp...dd..",
    "...ddd.dp.ddd...",
    "....dddppddd....",
    ".....dppppd.....",
    "....ddppppdd....",
    "...dd..pp..dd...",
    "..dd....pp..dd..",
    ".d.......pp...d.",
    ".........pp.....",
    ".........p......",
    "................",
  ],
  // 问号方块
  question: [
    "................",
    ".dddddddddddddd.",
    ".dwwwwwwwwwwwwd.",
    ".dwwppppppppwwd.",
    ".dwppddddddppwd.",
    ".dwppdwwwwdppwd.",
    ".dwwpdwwwdwppwd.",
    ".dwwwpdwdwwwpwd.",
    ".dwwwwpdwwwwpwd.",
    ".dwwwwwpdwwwpwd.",
    ".dwwwwwwpdwwpwd.",
    ".dwwwwwwwpwwpwd.",
    ".dwwwwwwwwwwpwd.",
    ".dwwwwwwwpppwwd.",
    ".dwwwwwwwwwwwwd.",
    ".dddddddddddddd.",
  ],
};

const COLOR_MAP: Record<string, string> = {
  d: "var(--pink-deep)",
  p: "var(--pink-primary)",
  w: "var(--surface)",
  t: "var(--text)",
};

export default function PixelIcon({ type, size = 48 }: PixelIconProps) {
  const pattern = PATTERNS[type];
  const rects: React.ReactNode[] = [];

  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const fill = COLOR_MAP[ch];
      if (!fill) continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={fill}
        />
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}
