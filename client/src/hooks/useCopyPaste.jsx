import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export function useCopyPaste(ctrlc,setctrlc,xy,setElements){

  useEffect(() => {
    function handleKeyDown(e){
      if(e.ctrlKey && e.key === "c"){
        if(ctrlc){
          setctrlc({...ctrlc});
        }
      }
      if(e.ctrlKey && e.key === "v"){
        if(!ctrlc) return;
        let abc = {...ctrlc};

        abc.x = xy.x - (abc.width/2);
        abc.y = xy.y - (abc.height/2);

        abc.id = uuidv4();
        setElements(prev => [...prev,abc]);

      }
    }
    window.addEventListener("keydown",handleKeyDown);

    return () => {
      window.removeEventListener("keydown",handleKeyDown);
    }

  },[ctrlc,xy]);

}