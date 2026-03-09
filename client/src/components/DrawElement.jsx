import React from 'react'

export function drawElement(ctx, el, isSelected = false) {
  ctx.strokeStyle = el.strokeColor || "black";
  ctx.lineWidth = el.strokeWidth || 2;
  if (isSelected) {
    ctx.strokeStyle = "blue";
  }
  if (el.type === "pen") {
    const points = el.points || [];
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  } else if (el.type === "rectangle") {
    ctx.strokeRect(el.x, el.y, el.width, el.height);
  } else if (el.type === "ellipse") {
    // ctx.strokeStyle = el.strokeColor || "black";
    ctx.lineWidth = el.strokeWidth || 2;

    const width = el.width || 0;
    const height = el.height || 0;

    const cx = el.x + width / 2;
    const cy = el.y + height / 2;
    const radiusX = Math.abs(width) / 2;
    const radiusY = Math.abs(height) / 2;

    if (radiusX === 0 || radiusY === 0) return;

    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }else if(el.type === "line"){
    ctx.beginPath();
    ctx.moveTo(el.x,el.y);
    ctx.lineTo(Math.abs(el.x + el.width),Math.abs(el.y + el.height));
    ctx.stroke();
  }else if(el.type === "aero"){
    ctx.beginPath();
    ctx.moveTo(el.x,el.y);
    ctx.lineTo(el.x + el.width , el.y + el.height);
    let endX = el.x + el.width;
    let endY = el.y + el.height;
    const angle = Math.atan2(endY - el.y, endX - el.x);
    
    ctx.lineTo(
      endX - 20 * Math.cos(angle - Math.PI / 6),
      endY - 20 * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - 20 * Math.cos(angle + Math.PI / 6),
      endY - 20 * Math.sin(angle + Math.PI / 6)
    );

    ctx.stroke();
  }else if(el.type === "rombus"){
    ctx.beginPath();
    let x = el.x;
    let y = el.y;
    let endX = el.x + el.width;
    let endY = el.y + el.height;

    ctx.moveTo(x + ((endX - x) / 2), y);
    ctx.lineTo(endX , y + ((endY - y)/2));
    ctx.lineTo(endX - ((endX - x) / 2), endY);
    ctx.lineTo(x , y + ((endY - y) / 2));
    ctx.lineTo(x + ((endX - x) / 2) , y);
    ctx.stroke();
  }
}
