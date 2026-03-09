import React from 'react'

function distanceFromSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } 
  else if (param > 1) {
    xx = x2;
    yy = y2;
  } 
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
}


function isNearLine(x, y, el) {

  const x1 = el.x;
  const y1 = el.y;

  const x2 = el.x + el.width;
  const y2 = el.y + el.height;

  const distance = distanceFromSegment(x,y,x1,y1,x2,y2);

  return distance < 8;
}

function isNearArrow(x,y,el){
  return isNearLine(x,y,el);
}

function isNearPen(x,y,el){

  const points = el.points;

  for(let i = 0; i < points.length - 1; i++){

    const p1 = points[i];
    const p2 = points[i+1];

    const distance = distanceFromSegment(
      x,
      y,
      p1.x,
      p1.y,
      p2.x,
      p2.y
    );

    if(distance < 8){
      return true;
    }

  }

  return false;
}

export function getElementAtPosition(x,y,elements){

  for(let i = elements.length - 1; i >= 0; i--){

    const el = elements[i];

    if(el.type === "rectangle" || el.type === "ellipse" || el.type === "rombus"){

      const minX = Math.min(el.x, el.x + el.width);
      const maxX = Math.max(el.x, el.x + el.width);
      const minY = Math.min(el.y, el.y + el.height);
      const maxY = Math.max(el.y, el.y + el.height);

      if(x >= minX && x <= maxX && y >= minY && y <= maxY){
        return el;
      }

    }

    if(el.type === "line"){
      if(isNearLine(x,y,el)) return el;
    }

    if(el.type === "aero"){
      if(isNearArrow(x,y,el)) return el;
    }

    if(el.type === "pen"){
      if(isNearPen(x,y,el)) return el;
    }

  }

  return null;
}
