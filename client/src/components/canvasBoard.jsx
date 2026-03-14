import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { drawElement } from "./DrawElement";
import { getElementAtPosition } from "../functions_files/elementPos";
import { drawSelectionBox } from "../utils/drawSelectionBox";
import { getWorldCoords } from "../utils/getWorldCoords";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useCopyPaste } from "../hooks/useCopyPaste";
import { getElementBounds } from "../utils/elementBound";
import { closeLive, startLive } from "../live_functions/start_and_close_live";

import { socket_link } from "../functions_files/socketlink";

const CanvasBoard = ({ elements, setElements, tool }) => {
  const canvasRef = useRef(null);
  const [drawing,setDrawing] = useState(false);
  const [currentElementId,setCurrentElementId] = useState(null);
  const [camera,setCamera] = useState({x:0,y:0,zoom:1});
  const [isPanning,setIsPanning] = useState(false);
  const [selectedId,setSelectedId] = useState(null);
  const [action,setAction] = useState(null);
  const [erage,setErage] = useState(false);
  const [ctrlc,setctrlc] = useState(null);
  const [xy,setxy] = useState({x:0,y:0});
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizeCorner, setResizeCorner] = useState(null);
  const socketRef = useRef(null);
  const [roomId,setRoomId] = useState(null);
  const [isHost,setIsHost] = useState(false);
  const [liveEnabled,setLiveEnabled] = useState(false);

  useUndoRedo(elements,setElements);
  useCopyPaste(ctrlc,setctrlc,xy,setElements);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.setTransform(camera.zoom,0,0,camera.zoom,camera.x,camera.y);
    // console.log("elements :", elements);
    elements.forEach(el => {
      drawElement(ctx,el);
      if(el.id === selectedId){
        drawSelectionBox(ctx,el);
      }
    });
  },[elements,camera]);

  useEffect(() => {
    if(tool === 'png' || tool === 'jpeg'){
      const canvas = canvasRef.current;
      const link = document.createElement("a");

      if(tool === "png"){
        link.download = "canvas-image.png";
        link.href = canvas.toDataURL("image/png");
      }

      if(tool === "jpeg"){
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0,0,tempCanvas.width,tempCanvas.height);

        tempCtx.drawImage(canvas,0,0);

        link.download = "canvas-image.jpeg";
        link.href = tempCanvas.toDataURL("image/jpeg",1.0);
      }

      link.click();
      return;
    }
    if(tool === 'start live'){
      startLive({setIsHost, setRoomId,setLiveEnabled,socketRef});
    }else if(tool === 'close live'){
      closeLive({socketRef,setLiveEnabled,setRoomId,setIsHost,roomId});
    }

  },[tool])

  useEffect(() => {
    let arr = elements.filter(ab => {
      return erage ? selectedId !== ab.id : ab;
    });
    setElements(arr);
  },[erage]);

  useEffect(() => {
    localStorage.setItem('elements', JSON.stringify([elements]))
  },[elements]);
  
  useEffect(()=>{
    socketRef.current = io(socket_link);
    socketRef.current.on("init-elements",(data)=>{
      console.log("data :", data);
      setElements(data);
    });

    socketRef.current.on("elements-update",(data)=>{
      setElements(prev => {
        if(JSON.stringify(prev) === JSON.stringify(data)){
          return prev;
        }
        return data;
      });
    });
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if(room){
      setRoomId(room);
      setLiveEnabled(true);
      socketRef.current.emit("join-room",room);
    }

    socketRef.current.on("init-elements",(data)=>{
      setElements(data);
    });

    socketRef.current.on("elements-update",(data)=>{
      setElements(data);
    });

    socketRef.current.on("room-closed",()=>{
      alert("Live session closed by host");
      setLiveEnabled(false);
    });
  },[]);

  
  useEffect(()=>{
    if(!liveEnabled) return;
    if(!socketRef.current) return;
    if(!roomId) return;
    socketRef.current.emit("canvas-update",{
      roomId,
      elements
    });

  },[elements]);

  function checkifclickonV(element){
    setctrlc(element);
  }

  function handleMouseDown(e){
    const pos = getWorldCoords(e.clientX,e.clientY,canvasRef,camera);
    setxy(pos);
    if (tool === "select") {
      const element = getElementAtPosition(pos.x, pos.y, elements);
      if (element) {
        setSelectedId(element.id);
        const cornerSize = 10;
        const bounds = getElementBounds(element);
        // console.log("bound", bounds)
        const nearLeft = Math.abs(pos.x - bounds.x) < cornerSize;
        const nearRight = Math.abs(pos.x - (bounds.x + bounds.width)) < cornerSize;
        const nearTop = Math.abs(pos.y - bounds.y) < cornerSize;
        const nearBottom = Math.abs(pos.y - (bounds.y + bounds.height)) < cornerSize;

        if (nearLeft && nearTop) {
          setResizeCorner("tl");
          setAction("resize");
        } 
        else if (nearRight && nearTop) {
          setResizeCorner("tr");
          setAction("resize");
        } 
        else if (nearLeft && nearBottom) {
          setResizeCorner("bl");
          setAction("resize");
        } 
        else if (nearRight && nearBottom) {
          setResizeCorner("br");
          setAction("resize");
        } 
        else {
          setAction( "move");
          setOffset({
            x: pos.x - element.x,
            y: pos.y - element.y,
          });
          console.log("action ",action, "offset", offset);
        }
        console.log(nearLeft , nearTop, nearRight, nearLeft);
        console.log("action ", action);
        checkifclickonV(element);
      } else {
        setSelectedId(null);
      }
      return;
    }

    if(tool === "erager"){
      const element = getElementAtPosition(pos.x,pos.y,elements);
      if(element){
        setSelectedId(element.id);
      }else{
        setSelectedId(null);
      }
      setErage(prev => !prev);
      return;
    }

    if(e.button === 1){
      setIsPanning(true);
      return;
    }

    const id = uuidv4();

    let newElement = {
      id,
      type:tool,
      x:pos.x,
      y:pos.y,
      width:0,
      height:0,
      strokeColor:"black",
      strokeWidth:2,
      points: tool === "pen" ? [{x:pos.x,y:pos.y}] : undefined
    };

    setElements(prev => [...prev,newElement]);
    setCurrentElementId(id);
    setDrawing(true);
  }

  function handleMouseMove(e){
    if (tool === "select" && selectedId && action) {
      const pos = getWorldCoords(e.clientX, e.clientY, canvasRef, camera);
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedId) return el;

          if (action === "move") {
            const newX = pos.x - offset.x;
            const newY = pos.y - offset.y;

            const dx = newX - el.x;
            const dy = newY - el.y;

            let newPoints = el.points;

            if (el.type === "pen") {
              newPoints = el.points.map(p => ({
                x: p.x + dx,
                y: p.y + dy
              }));
            }

            return {
              ...el,
              x: newX,
              y: newY,
              points: newPoints
            };
          }
          if (action === "resize") {
            const bounds = getElementBounds(el);

            let newX = bounds.x;
            let newY = bounds.y;
            let newWidth = bounds.width;
            let newHeight = bounds.height;

            if (resizeCorner === "br") {
              newWidth = pos.x - bounds.x;
              newHeight = pos.y - bounds.y;
            }
            if (resizeCorner === "tr") {
              newWidth = pos.x - bounds.x;
              newHeight = bounds.y + bounds.height - pos.y;
              newY = pos.y;
            }
            if (resizeCorner === "bl") {
              newWidth = bounds.x + bounds.width - pos.x;
              newHeight = pos.y - bounds.y;
              newX = pos.x;
            }
            if (resizeCorner === "tl") {
              newWidth = bounds.x + bounds.width - pos.x;
              newHeight = bounds.y + bounds.height - pos.y;
              newX = pos.x;
              newY = pos.y;
            }
            if(el.type === "pen"){
              const scaleX = newWidth / bounds.width;
              const scaleY = newHeight / bounds.height;
              const newPoints = el.points.map(p => ({
                x: newX + (p.x - bounds.x) * scaleX,
                y: newY + (p.y - bounds.y) * scaleY
              }));

              return {
                ...el,
                points: newPoints
              };

            }
            return {
              ...el,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight
            };
          }
          return el;
        })
      );
      return;
    }

    if(isPanning){
      setCamera(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
      return;
    }

    if(!drawing) return;

    const pos = getWorldCoords(e.clientX,e.clientY,canvasRef,camera);
    setElements(all => all.map(el => {
      if(el.id !== currentElementId) return el;
        if(el.type === "pen"){

          const newPoints = [...el.points, { x: pos.x, y: pos.y }];

          const xs = newPoints.map(p => p.x);
          const ys = newPoints.map(p => p.y);

          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);

          return {
            ...el,
            points: newPoints,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          };
        }
      return {
        ...el,
        width:pos.x - el.x,
        height:pos.y - el.y
      };

    }));

  }

  function handleMouseUp(){
    setDrawing(false);
    setIsPanning(false);
    setCurrentElementId(null);
    setAction(null);
    setResizeCorner(null);
  }

  function handleWheel(e){
    e.preventDefault();
    setCamera(prev => {
      let newZoom = prev.zoom - e.deltaY * 0.001;
      newZoom = Math.min(Math.max(newZoom,0.2),5);
      return {...prev,zoom:newZoom};

    });
  }

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{background:"beige",cursor:isPanning ? "grab" : "crosshair"}}

      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}

    />
  );
};

export default CanvasBoard;