import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PROJECT_TYPES = [
  {
    id: 1,
    name: "Web Development",
    description: "Create websites and web applications",
    imageUrl: "https://images.unsplash.com/photo-1622050756792-5b1180bbb873",
  },
  {
    id: 2,
    name: "YouTube Video",
    description: "Create and edit video content",
    imageUrl: "https://images.unsplash.com/photo-1611224885990-ab7363d1f2b9",
  },
  {
    id: 3,
    name: "Livestreaming",
    description: "Plan and execute live streams",
    imageUrl: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5",
  },
  {
    id: 4,
    name: "Course Creation",
    description: "Develop educational content",
    imageUrl: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31",
  },
];

interface ProjectTypeSelectorProps {
  onSelect: (typeId: number) => void;
}

export function ProjectTypeSelector({ onSelect }: ProjectTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<number>();

  return (
    <div className="space-y-4">
      <Label htmlFor="project-type">Project Type</Label>
      <Select
        value={selectedType?.toString()}
        onValueChange={(value) => {
          const typeId = parseInt(value);
          setSelectedType(typeId);
          onSelect(typeId);
        }}
      >
        <SelectTrigger id="project-type">
          <SelectValue placeholder="Select a project type" />
        </SelectTrigger>
        <SelectContent>
          {PROJECT_TYPES.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              <div className="flex items-center gap-3">
                <img
                  src={type.imageUrl}
                  alt={type.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <div>
                  <p className="font-medium">{type.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
