import { Droppable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";

function StrictModeDroppable({ children, ...props }: any) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
}

export default StrictModeDroppable;
