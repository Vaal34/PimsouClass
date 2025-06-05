import {
  UserCheck,
  ChevronsUpDown,
  ListRestart,
  GripVertical,
} from "lucide-react";
import * as React from "react";
import { shuffle } from "lodash";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../ui/input";
import { useUsers, type User } from "@/hooks/useUsers";
import { Card, CardContent } from "../ui/card";

// Composant pour un étudiant draggable
function DraggableStudent({
  student,
  groupIndex,
}: {
  student: User;
  groupIndex: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `student-${student.id}`,
      data: {
        student,
        groupIndex,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...listeners}
      {...attributes}
      className={`font-medium justify-content items-center flex gap-2 bg-gray-100 py-1 px-2 rounded-md ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <GripVertical size={18} className="" />
      <p className="w-4/5 truncate">{student.name}</p>
    </div>
  );
}

// Composant pour une carte de groupe droppable
function DroppableGroupCard({
  groupIndex,
  children,
}: {
  group: User[];
  groupIndex: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${groupIndex}`,
    data: {
      groupIndex,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      key={`group-${groupIndex}`}
      className={`border-2 bg-white p-1 overflow-hidden transition-colors ${
        isOver ? "border-chart-1 bg-gray-50 " : ""
      }`}
    >
      <CardContent className="flex flex-col gap-2 p-2">
        <h1 className="text-black">G.{groupIndex + 1}</h1>
        {children}
      </CardContent>
    </Card>
  );
}

export default function Groupe() {
  const [open, setOpen] = React.useState(false);
  const [selectedStudents, setSelectedStudents] = React.useState<User[]>([]);
  const [isCreated, setCreated] = React.useState<boolean>(false);
  const [tailleGroupe, setTailleGroupe] = React.useState<number>();
  const [listGroup, setListGroup] = React.useState<User[][]>();
  const [activeStudent, setActiveStudent] = React.useState<User | null>(null);

  // Fonction pour gérer le début du drag
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const student = active.data.current?.student;
    setActiveStudent(student);
  };

  // Fonction pour gérer la fin du drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStudent(null);

    if (!over || !listGroup) return;

    const activeStudent = active.data.current?.student;
    const sourceGroupIndex = active.data.current?.groupIndex;
    const targetGroupIndex = over.data.current?.groupIndex;

    if (sourceGroupIndex === targetGroupIndex || targetGroupIndex === undefined)
      return;

    // Créer une copie des groupes
    const newGroups = [...listGroup];

    // Retirer l'étudiant du groupe source
    newGroups[sourceGroupIndex] = newGroups[sourceGroupIndex].filter(
      (student) => student.id !== activeStudent.id
    );

    // Ajouter l'étudiant au groupe cible
    newGroups[targetGroupIndex] = [
      ...newGroups[targetGroupIndex],
      activeStudent,
    ];

    setListGroup(newGroups);
  };

  const createGroupe = (selectedStudents: User[], tailleGroupe: number) => {
    // D'abord mélanger les étudiants avec lodash shuffle
    const shuffledStudents = shuffle(selectedStudents);

    const totalStudents = shuffledStudents.length;

    // Calculer le nombre optimal de groupes
    const nombreGroupes = Math.ceil(totalStudents / tailleGroupe);

    // Calculer la taille de base de chaque groupe
    const tailleBase = Math.floor(totalStudents / nombreGroupes);

    // Calculer combien de groupes auront une personne supplémentaire
    const groupesAvecPersonneSupplementaire = totalStudents % nombreGroupes;

    const groups: User[][] = [];
    let index = 0;

    // Créer les groupes avec distribution équitable
    for (let i = 0; i < nombreGroupes; i++) {
      // Les premiers groupes auront une personne de plus si nécessaire
      const tailleDuGroupe =
        i < groupesAvecPersonneSupplementaire ? tailleBase + 1 : tailleBase;
      const groupe = shuffledStudents.slice(index, index + tailleDuGroupe);
      groups.push(groupe);
      index += tailleDuGroupe;
    }

    setListGroup(groups);
    return groups;
  };

  // Utilisation de notre hook pour récupérer les utilisateurs
  const { data: students = [], isLoading, error } = useUsers();

  const isAllSelected = selectedStudents.length === students.length;
  const isSomeSelected =
    selectedStudents.length > 0 && selectedStudents.length < students.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...students]);
    }
  };

  const handleCreated = () => {
    setCreated(!isCreated);
  };

  const handleTailleGroupe = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const taille = parseInt(value);
    if (!isNaN(taille) && taille > 0) {
      setTailleGroupe(taille);
    } else if (value === "") {
      setTailleGroupe(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-[350px] gap-2">
        <div className="w-3/4 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="w-1/4 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-[350px] gap-2">
        <div className="w-3/4 p-3 border-2 border-red-300 bg-red-50 rounded-lg text-red-700">
          Erreur lors du chargement des utilisateurs
        </div>
        <Input
          type="number"
          placeholder="Taille des groupes"
          className="w-1/4"
          value={tailleGroupe || ""}
          onChange={handleTailleGroupe}
        />
      </div>
    );
  }

  if (isCreated) {
    return (
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Style global pour le curseur pendant le drag */}
        {activeStudent && <style>{`* { cursor: grabbing !important; }`}</style>}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {listGroup &&
              listGroup.map((group, groupIndex) => (
                <DroppableGroupCard
                  key={`group-${groupIndex}`}
                  group={group}
                  groupIndex={groupIndex}
                >
                  {group.map((student) => (
                    <DraggableStudent
                      key={student.id}
                      student={student}
                      groupIndex={groupIndex}
                    />
                  ))}
                </DroppableGroupCard>
              ))}
          </div>
          <Button
            variant="default"
            size="default"
            aria-label="Réinitiliser les groupes"
            className="bg-chart-3 text-black cursor-pointer w-full"
            onClick={() => {
              handleCreated();
              if (tailleGroupe) {
                createGroupe(selectedStudents, tailleGroupe);
              }
            }}
          >
            Reset
            <ListRestart className="w-4 h-4" color="#000" />
          </Button>
        </div>

        <DragOverlay>
          {activeStudent ? (
            <div className="font-medium justify-content items-center flex gap-2 bg-chart-1 p-1 rounded-md shadow-lg border-2 border-chart-1">
              <GripVertical size={18} />
              <p className="w-4/5 truncate">{activeStudent.name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  return (
    <div className="w-[350px] flex flex-col gap-2">
      <div className="flex w-full gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="noShadow"
              role="combobox"
              aria-expanded={open}
              className="w-3/4 justify-between border-2 bg-chart-5 px-4 py-3 text-left font-medium transition-all cursor-pointer"
            >
              <span className="truncate">
                {selectedStudents.length > 0
                  ? selectedStudents.length === students.length
                    ? "Tous sélectionnés"
                    : `${selectedStudents.length} sélectionné${
                        selectedStudents.length > 1 ? "s" : ""
                      }`
                  : "Sélectionner des utilisateurs..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 rounded-lg" align="start">
            <Command className="border-none">
              <CommandList className="max-h-[300px]">
                <CommandGroup className="p-2">
                  {/* Select All Option */}
                  <CommandItem
                    value="select-all"
                    onSelect={handleSelectAll}
                    className="cursor-pointer mb-2 rounded-lg bg-chart-5"
                  >
                    <div className="border-none bg-chart-1 pointer-events-none size-5 shrink-0 rounded-md border-2 transition-all mr-3 flex items-center justify-center">
                      {isAllSelected && (
                        <UserCheck className="size-3 text-primary-foreground" />
                      )}
                      {isSomeSelected && !isAllSelected && (
                        <div className="size-2 rounded-sm bg-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium">
                      {isAllSelected
                        ? "Désélectionner tout"
                        : "Sélectionner tout"}
                    </span>
                  </CommandItem>

                  {/* User Options */}
                  <div className="flex flex-col gap-2">
                    {students.map((student) => (
                      <CommandItem
                        key={student.id}
                        value={student.id.toString()}
                        onSelect={(currentValue) => {
                          setSelectedStudents(
                            selectedStudents.some(
                              (s) => s.id.toString() === currentValue
                            )
                              ? selectedStudents.filter(
                                  (s) => s.id.toString() !== currentValue
                                )
                              : [...selectedStudents, student]
                          );
                        }}
                        className="rounded-lg border-none bg-chart-5/50 hover:bg-chart-5 cursor-pointer transition-colors"
                      >
                        <div className="border-none bg-chart-1 pointer-events-none size-5 shrink-0 rounded-md transition-all mr-3 flex items-center justify-center">
                          {selectedStudents.some(
                            (s) => s.id === student.id
                          ) && (
                            <UserCheck className="size-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          type="number"
          placeholder="Taille des groupes"
          className="w-1/4"
          value={tailleGroupe || ""}
          onChange={handleTailleGroupe}
        />
      </div>
      <div className="w-full">
        <Button
          onClick={() => {
            if (tailleGroupe && selectedStudents.length > 0) {
              createGroupe(selectedStudents, tailleGroupe);
              setCreated(true);
            }
          }}
          className="w-full cursor-pointer"
          variant="default"
        >
          Création des groupes
        </Button>
      </div>
    </div>
  );
}
