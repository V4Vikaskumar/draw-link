export function getElementBounds(el){

  if(el.type === "pen"){
    const xs = el.points.map(p => p.x);
    const ys = el.points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  return {
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height
  };
}