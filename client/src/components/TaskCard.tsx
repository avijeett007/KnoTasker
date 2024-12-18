import type { Task } from "@db/schema";
import { TaskStatus } from "../../../shared/types";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import { TaskDialog } from "./TaskDialog";

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={task.id.toString()} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsDialogOpen(true)}
          >
            <Card className="mb-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing active:shadow-lg active:scale-[1.02] hover:border-primary/50">
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(task.createdAt || Date.now()), "MMM d, yyyy")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {task.assignedToId ? "U" : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === TaskStatus.TODO
                    ? "bg-blue-100 text-blue-700"
                    : task.status === TaskStatus.IN_PROGRESS
                    ? "bg-yellow-100 text-yellow-700"
                    : task.status === TaskStatus.BLOCKED
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {task.status === TaskStatus.TODO ? "To Do" : 
                   task.status === TaskStatus.IN_PROGRESS ? "In Progress" : 
                   task.status === TaskStatus.BLOCKED ? "Blocked" : "Done"}
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </Draggable>
      <TaskDialog 
        task={task}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
