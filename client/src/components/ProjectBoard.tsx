import { DragDropContext, DropResult, DroppableProvided, DroppableStateSnapshot } from "react-beautiful-dnd";
import { TaskCard } from "./TaskCard";
import { useTasks } from "../hooks/use-tasks";
import type { Task } from "@db/schema";
import { TaskStatus } from "../../../shared/types";
import { useState } from "react";
import StrictModeDroppable from "./StrictModeDroppable";

const COLUMNS = [
  { id: TaskStatus.TODO, title: "To Do" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress" },
  { id: TaskStatus.BLOCKED, title: "Blocked" },
  { id: TaskStatus.DONE, title: "Done" },
];

interface ProjectBoardProps {
  projectId: number;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const { tasks, updateTask } = useTasks(projectId);
  const [isDragging, setIsDragging] = useState(false);

  const getTasksByStatus = (status: string) =>
    tasks?.filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order) || [];

  const calculateNewOrder = (result: DropResult): number => {
    const destIndex = result.destination!.index;
    const tasksInNewStatus = getTasksByStatus(result.destination!.droppableId);
    
    if (destIndex === 0) {
      return (tasksInNewStatus[0]?.order ?? 0) - 1000;
    } else if (destIndex === tasksInNewStatus.length) {
      return (tasksInNewStatus[tasksInNewStatus.length - 1]?.order ?? 0) + 1000;
    } else {
      const prevTask = tasksInNewStatus[destIndex - 1];
      const nextTask = tasksInNewStatus[destIndex];
      return (prevTask.order + nextTask.order) / 2;
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const task = tasks?.find((t) => t.id === parseInt(result.draggableId));
    if (!task) return;
    
    const newOrder = calculateNewOrder(result);
    
    updateTask({
      taskId: task.id,
      updates: {
        status: result.destination.droppableId as TaskStatus,
        order: newOrder,
      },
    });
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {COLUMNS.map((column) => (
          <div 
            key={column.id} 
            className={`bg-muted/30 rounded-lg p-4 transition-colors duration-200 ${
              isDragging ? 'bg-muted/40' : ''
            }`}
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {column.title}
              <span className="ml-auto text-muted-foreground text-sm">
                {getTasksByStatus(column.id).length}
              </span>
            </h2>
            <StrictModeDroppable droppableId={column.id} type="TASK">
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] rounded-md transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-muted/50 border-2 border-dashed border-primary/50' : ''
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
