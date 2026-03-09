import { useEffect, useState } from "react";

export function useUndoRedo(elements, setElements) {

  const [back, setBack] = useState([]);

  useEffect(() => {
    function handlekeydown(e){
      if(e.ctrlKey && e.key === "z"){
        if(elements.length === 0) return;
        setBack(prev => [...prev, elements[elements.length - 1]]);
        let arr = [...elements];
        arr.pop();
        setElements(arr);
      }

      if(e.ctrlKey && e.key === "y"){
        if(back.length === 0) return;
        let arr = [...back];
        let a = arr.pop();
        setElements(prev => [...prev, a]);
        setBack(arr);
      }

    }
    window.addEventListener("keydown",handlekeydown);
    return () => {
      window.removeEventListener("keydown",handlekeydown);
    }
  },[elements,back]);

}