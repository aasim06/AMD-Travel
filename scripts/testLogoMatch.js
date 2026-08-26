const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

function drawExactWebsiteLogo(ctx, margin = 36, topY = 24) {
  // 1. Draw Orange Rounded Square Icon (#FF5722)
  const iconW = 44;
  const iconH = 44;
  const iconR = 12;
  const iconX = margin;
  const iconY = topY;

  ctx.fillStyle = "#FF5722";
  ctx.beginPath();
  ctx.roundRect(iconX, iconY, iconW, iconH, iconR);
  ctx.fill();

  // White Plane/Compass Icon
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.8;
  
  // Dashed Circle
  ctx.beginPath();
  ctx.arc(iconX + iconW / 2, iconY + iconH / 2, 11, 0, Math.PI * 2);
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([3, 2.5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1.0;

  // Plane Shape Path
  ctx.beginPath();
  const cx = iconX + iconW / 2;
  const cy = iconY + iconH / 2;
  ctx.moveTo(cx - 8, cy + 2.5);
  ctx.lineTo(cx - 3, cy - 0);
  ctx.lineTo(cx - 0.5, cy - 6);
  ctx.lineTo(cx + 1, cy - 0.5);
  ctx.lineTo(cx + 5, cy - 2);
  ctx.lineTo(cx + 4, cy + 2.5);
  ctx.lineTo(cx + 9.5, cy + 0.5);
  ctx.lineTo(cx + 6.5, cy + 5);
  ctx.lineTo(cx - 8, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Draw Text: "AMD Global" + "TRAVEL"
  const textX = iconX + iconW + 12;

  ctx.textAlign = "left";
  ctx.font = '800 22px "Segoe UI", Arial, sans-serif';

  // "AMD"
  ctx.fillStyle = "#111827";
  ctx.fillText("AMD", textX, iconY + 24);
  const amdW = ctx.measureText("AMD").width;

  // " Global"
  ctx.fillStyle = "#FF5722";
  ctx.fillText(" Global", textX + amdW, iconY + 24);

  // Subtitle: "TRAVEL"
  ctx.fillStyle = "#6B7280";
  ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
  ctx.fillText("TRAVEL", textX + 1, iconY + 40);
}

const canvas = createCanvas(736, 900);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 736, 900);

drawExactWebsiteLogo(ctx, 36, 26);

const outPath = path.join(process.cwd(), 'public', 'images', 'test_exact_logo.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log('✅ Exact website logo canvas test generated successfully at:', outPath);
