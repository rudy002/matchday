import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { messages } from "@/lib/messages";
import { heatPattern } from "@/lib/share-meta";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

const COLORS = {
  paper: "#f2f7f9",
  ink: "#0e1b27",
  muted: "#586a76",
  accent: "#00767f",
  heat: ["#e1eaee", "#aacdd2", "#6fb0b8", "#2f939e", "#00767f"],
};

const GRID_COLUMNS = 7;
const GRID_ROWS = 6;

const [fontBold, fontMedium] = await Promise.all([
  readFile(
    join(
      process.cwd(),
      "assets/fonts/bricolage-grotesque-latin-800-normal.woff",
    ),
  ),
  readFile(
    join(
      process.cwd(),
      "assets/fonts/bricolage-grotesque-latin-500-normal.woff",
    ),
  ),
]);

function titleSize(title: string): number {
  if (title.length <= 24) return 84;
  if (title.length <= 48) return 64;
  return 50;
}

type ShareImageInput = {
  title: string;
  details: string[];
  seed: string;
};

export function renderShareImage({ title, details, seed }: ShareImageInput) {
  const cells = heatPattern(seed, GRID_COLUMNS * GRID_ROWS);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 72,
        background: COLORS.paper,
        fontFamily: "Bricolage",
        color: COLORS.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 600,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.accent,
          }}
        >
          {messages.app.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize(title),
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {details.map((line) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  fontSize: 32,
                  fontWeight: 500,
                  color: COLORS.muted,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: 384,
          gap: 8,
        }}
      >
        {cells.map((level, index) => (
          <div
            key={index}
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: COLORS.heat[level],
            }}
          />
        ))}
      </div>
    </div>,
    {
      ...SHARE_IMAGE_SIZE,
      fonts: [
        { name: "Bricolage", data: fontBold, weight: 800, style: "normal" },
        { name: "Bricolage", data: fontMedium, weight: 500, style: "normal" },
      ],
    },
  );
}
