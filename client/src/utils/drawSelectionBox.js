export function drawSelectionBox(ctx, el) {
  ctx.save();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  ctx.strokeRect(el.x, el.y, el.width, el.height);

  ctx.fillStyle = "white";
  ctx.strokeStyle = "blue";
  ctx.setLineDash([]);

  // ctx.fillRect(el.x + el.width - 5, el.y + el.height - 5, 10, 10);
  ctx.strokeRect(el.x + el.width - 5, el.y + el.height - 5, 10, 10);
  ctx.strokeRect(el.x - 5, el.y  - 5, 10, 10);
  ctx.strokeRect(el.x - 5, el.y + el.height - 5, 10, 10);
  ctx.strokeRect(el.x + el.width - 5, el.y - 5, 10, 10);

  ctx.restore();
}