import { Server } from "socket.io";

const io = new Server(3001,{
  cors:{origin:"*"}
});

const rooms = {};

io.on("connection",(socket)=>{

  socket.on("join-room",(roomId)=>{

    socket.join(roomId);

    if(!rooms[roomId]){
      rooms[roomId] = {elements:[],host:socket.id};
    }

    socket.emit("init-elements",rooms[roomId].elements);

  });

  socket.on("canvas-update",({roomId,elements})=>{

    if(!rooms[roomId]) return;

    rooms[roomId].elements = elements;

    socket.to(roomId).emit("elements-update",elements);

  });

  socket.on("close-room",(roomId)=>{

    io.to(roomId).emit("room-closed");

    delete rooms[roomId];

  });

});