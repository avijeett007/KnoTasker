import { Droppable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";

import { DroppableProps } from "react-beautiful-dnd";

interface StrictModeDroppableProps extends DroppableProps {
  children: (provided: any, snapshot: any) => React.ReactElement;
}

function StrictModeDroppable({ children, ...props }: StrictModeDroppableProps) {
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
