import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { TaskCard } from "./TaskCard";
import { useTasks } from "../hooks/use-tasks";
import type { Task } from "@db/schema";

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "blocked", title: "Blocked" },
  { id: "done", title: "Done" },
];

interface ProjectBoardProps {
  projectId: number;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const { tasks, updateTask } = useTasks(projectId);

  const getTasksByStatus = (status: string) =>
    tasks?.filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order) || [];

  const calculateNewOrder = (result: any, getTasksByStatus: (status: string) => any[]) => {
    const destIndex = result.destination.index;
    const tasksInNewStatus = getTasksByStatus(result.destination.droppableId);
    
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const task = tasks?.find((t) => t.id === parseInt(result.draggableId));
    if (!task) return;
    
    updateTask({
      taskId: task.id,
      updates: {
        status: result.destination.droppableId,
        order: calculateNewOrder(result, getTasksByStatus),
      },
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {COLUMNS.map((column) => (
          <div key={column.id} className="bg-muted/30 rounded-lg p-4">
            <h2 className="font-semibold mb-4">{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-muted/50' : ''
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
