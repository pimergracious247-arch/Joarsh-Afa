import type { LanguageCode, UserStats } from '../types';
import type { UIStrings } from '../data/translations';

export interface AchievementCardResult {
  dataUrl: string;
  file: File | null;
  title: string;
  text: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCoinIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD02C';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#C27200';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#FFF7B2';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - radius * 0.42);
  ctx.lineTo(cx, cy + radius * 0.42);
  ctx.moveTo(cx - radius * 0.25, cy - radius * 0.16);
  ctx.lineTo(cx + radius * 0.25, cy - radius * 0.16);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#9A5400';
  ctx.stroke();
}

function drawFlameIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - 22 * scale);
  ctx.bezierCurveTo(
    cx + 16 * scale,
    cy - 6 * scale,
    cx + 18 * scale,
    cy + 14 * scale,
    cx,
    cy + 22 * scale
  );
  ctx.bezierCurveTo(
    cx - 18 * scale,
    cy + 14 * scale,
    cx - 16 * scale,
    cy - 6 * scale,
    cx,
    cy - 22 * scale
  );
  ctx.closePath();
}

function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const [header, base64] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mime });
  } catch {
    return null;
  }
}

export function generateAchievementSummaryCard(
  stats: UserStats,
  lang: LanguageCode,
  t: UIStrings
): AchievementCardResult {
  const width = 900;
  const height = 520;
  const isRtl = lang === 'ar';
  const summaryText = t.achievementSummaryText
    .replace('{coins}', String(stats.totalCoins))
    .replace('{streak}', String(stats.streakDays));
  const title = t.achievementCardTitle;

  if (typeof document === 'undefined') {
    return { dataUrl: '', file: null, title, text: summaryText };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: '', file: null, title, text: summaryText };
  }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#BFE3FF');
  skyGrad.addColorStop(0.55, '#DCEEFF');
  skyGrad.addColorStop(1, '#EFF7FF');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  const glowGrad = ctx.createRadialGradient(width / 2, 80, 10, width / 2, 80, 360);
  glowGrad.addColorStop(0, 'rgba(255, 245, 198, 0.92)');
  glowGrad.addColorStop(0.5, 'rgba(255, 245, 198, 0.3)');
  glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  (
    [
      [95, 95, 58],
      [150, 82, 70],
      [205, 102, 50],
      [720, 88, 62],
      [785, 76, 72],
      [835, 100, 48],
    ] as Array<[number, number, number]>
  ).forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.save();
  ctx.shadowColor = 'rgba(30, 58, 138, 0.14)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  drawRoundedRect(ctx, 56, 46, 788, 428, 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, 56, 46, 788, 428, 36);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DCEBFF';
  ctx.stroke();

  ctx.fillStyle = '#FFE675';
  ctx.beginPath();
  ctx.arc(width / 2, 114, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#F5B935';
  ctx.stroke();

  ctx.fillStyle = '#7A5400';
  drawRoundedRect(ctx, width / 2 - 4, 93, 8, 42, 4);
  ctx.fill();
  drawRoundedRect(ctx, width / 2 - 14, 103, 28, 8, 4);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.direction = isRtl ? 'rtl' : 'ltr';
  ctx.fillStyle = '#5C7299';
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(t.appTitle, width / 2, 174);

  ctx.fillStyle = '#14274E';
  ctx.font = '800 34px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(title, width / 2, 214);

  const boxWidth = 336;
  const boxHeight = 160;
  const startX = 96;
  const boxY = 246;

  drawRoundedRect(ctx, startX, boxY, boxWidth, boxHeight, 28);
  ctx.fillStyle = '#FFF9DF';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#F5D46B';
  ctx.stroke();

  drawCoinIcon(ctx, 264, 292, 22);
  ctx.fillStyle = '#14274E';
  ctx.font = '800 44px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(String(stats.totalCoins), 264, 360);
  ctx.fillStyle = '#5C7299';
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(t.totalCoins, 264, 388);

  drawRoundedRect(ctx, 468, boxY, boxWidth, boxHeight, 28);
  ctx.fillStyle = '#FFF2EB';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#FDBA74';
  ctx.stroke();

  ctx.fillStyle = '#FFE4D6';
  ctx.beginPath();
  ctx.arc(636, 292, 26, 0, Math.PI * 2);
  ctx.fill();
  drawFlameIcon(ctx, 636, 293, 0.72);
  ctx.fillStyle = '#EA580C';
  ctx.fill();

  ctx.fillStyle = '#14274E';
  ctx.font = '800 44px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(String(stats.streakDays), 636, 360);
  ctx.fillStyle = '#5C7299';
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(t.dayStreak, 636, 388);

  ctx.fillStyle = '#47608B';
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(t.quizCompleteSubtitle, width / 2, 444);

  const dataUrl = canvas.toDataURL('image/png');
  return {
    dataUrl,
    file: dataUrlToFile(dataUrl, 'bible-quest-achievement.png'),
    title,
    text: summaryText,
  };
}
