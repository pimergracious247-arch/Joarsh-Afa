import type { TreasuryCard } from '../types';

export interface TreasuryCardImage {
  dataUrl: string;
  file: File | null;
  shareText: string;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function generateTreasuryCardImage(card: TreasuryCard): TreasuryCardImage {
  const shareText = `"${card.verseText}" — ${card.reference} (${card.title}) | Bible Quest Scripture Treasury`;
  if (typeof document === 'undefined') {
    return { dataUrl: '', file: null, shareText };
  }

  const width = 960;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: '', file: null, shareText };
  }

  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#88C8FF');
  bgGrad.addColorStop(0.55, '#E4F3FF');
  bgGrad.addColorStop(1, '#FFF6CC');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const sunGlow = ctx.createRadialGradient(820, 110, 20, 820, 110, 260);
  sunGlow.addColorStop(0, 'rgba(255, 224, 102, 0.72)');
  sunGlow.addColorStop(1, 'rgba(255, 224, 102, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, height);

  const pad = 44;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.beginPath();
  ctx.roundRect(pad, pad, 872, 552, 34);
  ctx.fill();

  ctx.strokeStyle = '#F5B935';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(58, 58, 844, 524, 24);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#B45309';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BIBLE QUEST · SCRIPTURE TREASURY', width / 2, 118);

  ctx.fillStyle = '#14274E';
  ctx.font = '800 38px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(card.reference, width / 2, 174);

  ctx.fillStyle = '#2F8FFF';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(card.title, width / 2, 212);

  ctx.fillStyle = '#1E293B';
  ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
  const lines = wrapText(ctx, `“${card.verseText}”`, 770);
  let y = 286;
  for (const line of lines.slice(0, 5)) {
    ctx.fillText(line, width / 2, y);
    y += 44;
  }

  ctx.fillStyle = '#5C7299';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  const refLines = wrapText(ctx, card.reflection, 740);
  let ry = Math.max(y + 24, 495);
  for (const rLine of refLines.slice(0, 2)) {
    ctx.fillText(rLine, width / 2, ry);
    ry += 28;
  }

  const dataUrl = canvas.toDataURL('image/png');
  let file: File | null = null;
  try {
    const [, base64] = dataUrl.split(',');
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    file = new File([bytes], `bible-quest-${card.id}.png`, { type: 'image/png' });
  } catch {
    file = null;
  }

  return { dataUrl, file, shareText };
}
