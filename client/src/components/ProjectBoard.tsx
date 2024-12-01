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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const task = tasks?.find((t) => t.id.toString() === result.draggableId);
    if (!task) return;

    const newStatus = result.destination.droppableId;
    const newOrder = result.destination.index;

    updateTask({
      taskId: task.id,
      updates: {
        status: newStatus,
        order: newOrder,
      },
    });
  };

  const getTasksByStatus = (status: string) =>
    tasks?.filter((task) => task.status === status).sort((a, b) => a.order - b.order) || [];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="bg-muted/50 rounded-lg p-4"
          >
            <h2 className="font-semibold mb-4">{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[200px]"
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
