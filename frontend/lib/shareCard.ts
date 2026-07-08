interface ShareArticle {
  title: string;
  summary_30s?: string | null;
  source: string;
  impact_score: number;
  trend_score: number;
  topics?: string[] | null;
  url: string;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      if (linesDrawn === maxLines - 1) {
        ctx.fillText(line.trim() + "...", x, currentY);
        return currentY;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
      linesDrawn++;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export async function generateShareCard(article: ShareArticle): Promise<Blob> {
  const W = 1200;
  const H = 630;
  const PADDING = 64;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#07111F";
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow top-left (brand accent)
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 700);
  glow.addColorStop(0, "rgba(108,99,255,0.10)");
  glow.addColorStop(1, "rgba(108,99,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Radial glow bottom-right (teal)
  const glow2 = ctx.createRadialGradient(W, H, 0, W, H, 600);
  glow2.addColorStop(0, "rgba(22,199,154,0.07)");
  glow2.addColorStop(1, "rgba(22,199,154,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, "#6C63FF");
  bar.addColorStop(0.5, "#16C79A");
  bar.addColorStop(1, "#6C63FF");
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 4);

  // Novique logo - dot
  ctx.beginPath();
  ctx.arc(PADDING, 58, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#6C63FF";
  ctx.fill();

  // Novique wordmark
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Novique", PADDING + 20, 67);

  // Source (top right)
  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#64748B";
  const sourceText = `via ${article.source}`;
  ctx.fillText(sourceText, W - PADDING - ctx.measureText(sourceText).width, 67);

  // Topic badge
  const topicLabel = (article.topics?.[0] ?? "AI Signal").toUpperCase();
  const badgeX = PADDING;
  const badgeY = 110;
  const badgePadX = 14;
  const badgePadY = 8;
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  const badgeW = ctx.measureText(topicLabel).width + badgePadX * 2;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, 30, 15);
  ctx.fillStyle = "rgba(108,99,255,0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(108,99,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#6C63FF";
  ctx.fillText(topicLabel, badgeX + badgePadX, badgeY + badgePadY + 6);

  // Title
  ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  const titleBottom = wrapText(ctx, article.title, PADDING, 190, W - PADDING * 2, 66, 3);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, titleBottom + 10);
  ctx.lineTo(W - PADDING, titleBottom + 10);
  ctx.stroke();

  // Summary
  if (article.summary_30s) {
    ctx.font = "400 22px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#94A3B8";
    const summaryStartY = Math.min(titleBottom + 40, 420);
    wrapText(ctx, article.summary_30s, PADDING, summaryStartY, W - PADDING * 2, 34, 3);
  }

  // Bottom bar background
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.fillRect(0, H - 80, W, 80);

  // Bottom border top
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 80);
  ctx.lineTo(W, H - 80);
  ctx.stroke();

  // Impact score
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#6C63FF";
  ctx.fillText(`Impact ${Math.round(article.impact_score)}`, PADDING, H - 36);

  // Separator dot
  ctx.beginPath();
  ctx.arc(PADDING + ctx.measureText(`Impact ${Math.round(article.impact_score)}`).width + 16, H - 41, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fill();

  // Momentum score
  const impactTextW = ctx.measureText(`Impact ${Math.round(article.impact_score)}`).width;
  ctx.fillStyle = "#16C79A";
  ctx.fillText(`Momentum ${Math.round(article.trend_score)}`, PADDING + impactTextW + 28, H - 36);

  // Watermark right side
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  const wm = "novique.ai";
  ctx.fillText(wm, W - PADDING - ctx.measureText(wm).width, H - 36);

  // Small dot before watermark
  ctx.beginPath();
  ctx.arc(W - PADDING - ctx.measureText(wm).width - 14, H - 41, 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(108,99,255,0.5)";
  ctx.fill();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

export async function shareArticleAsImage(article: ShareArticle): Promise<"shared" | "downloaded" | "copied"> {
  const blob = await generateShareCard(article);
  const file = new File([blob], "novique-signal.png", { type: "image/png" });

  // Web Share API Level 2 — native OS share sheet with image file
  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: article.title,
      text: `${article.title}\n\nvia Novique AI Intelligence`,
    });
    return "shared";
  }

  // Web Share API Level 1 — native share sheet without image (URL only)
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({
      title: article.title,
      text: article.summary_30s ?? article.title,
      url: article.url,
    });
    return "shared";
  }

  // Desktop fallback — download the image
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = "novique-signal.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
  return "downloaded";
}
