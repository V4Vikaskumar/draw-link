import { v4 as uuidv4 } from "uuid";

export function startLive({setIsHost, setRoomId,setLiveEnabled,socketRef}){
    const newRoom = uuidv4();
    setRoomId(newRoom);
    setIsHost(true);
    setLiveEnabled(true);
    socketRef.current.emit("join-room",newRoom);
    const link = `${window.location.origin}?room=${newRoom}`;
    prompt("Share this link",link);
}

export function closeLive({socketRef,setLiveEnabled,setRoomId,setIsHost,roomId}){
    socketRef.current.emit("close-room",roomId);
    setLiveEnabled(false);
    setRoomId(null);
    setIsHost(false);

}