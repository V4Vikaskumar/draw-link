export function getWorldCoords(clientX, clientY, canvasRef, camera) {
  const rect = canvasRef.current.getBoundingClientRect();

  return {
    x: (clientX - rect.left - camera.x) / camera.zoom,
    y: (clientY - rect.top - camera.y) / camera.zoom
  };
}