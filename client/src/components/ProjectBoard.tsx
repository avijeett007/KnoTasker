import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { TaskCard } from "./TaskCard";
import { useTasks } from "../hooks/use-tasks";
import type { Task } from "@db/schema";

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "blocked", title: "Blocked" },
  { id: "done", title: "Done" },
];

interface ProjectBoardProps {
  projectId: number;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const { tasks, updateTask } = useTasks(projectId);

  const getTasksByStatus = (status: string) =>
    tasks?.filter((task) => task.status === status).sort((a, b) => a.order - b.order) || [];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const task = tasks?.find((t) => t.id.toString() === result.draggableId);
    if (!task) return;

    const newStatus = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Calculate new order
    const tasksInNewStatus = getTasksByStatus(newStatus);
    let newOrder = 0;
    
    if (destIndex === 0) {
      newOrder = (tasksInNewStatus[0]?.order ?? 0) - 1000;
    } else if (destIndex === tasksInNewStatus.length) {
      newOrder = (tasksInNewStatus[tasksInNewStatus.length - 1]?.order ?? 0) + 1000;
    } else {
      const prevTask = tasksInNewStatus[destIndex - 1];
      const nextTask = tasksInNewStatus[destIndex];
      newOrder = (prevTask.order + nextTask.order) / 2;
    }

    updateTask({
      taskId: task.id,
      updates: {
        status: newStatus,
        order: newOrder,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {COLUMNS.map((column) => (
          <div key={column.id} className="bg-muted/30 rounded-lg p-4 min-h-[500px]">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {column.title}
              <span className="ml-auto text-muted-foreground text-sm">
                {getTasksByStatus(column.id).length}
              </span>
            </h2>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {getTasksByStatus(column.id).map((task: Task, index: number) => (
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
