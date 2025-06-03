import { UserCheck, ChevronsUpDown } from "lucide-react";
import * as React from "react";

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

export default function Groupe() {
  const [open, setOpen] = React.useState(false);
  const [selectedStudents, setSelectedStudents] = React.useState<User[]>([]);
  const [isCreated, setCreated] = React.useState<boolean>(false)

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
    setCreated(!isCreated)
  }

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
        />
      </div>
    );
  }

  if (isCreated) {
    return(
        <div className="grid grid-cols-3">
            
        </div>
    )
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
                    <div className="border-none bg-chart-1 pointer-events-none size-5 shrink-0 rounded-md border-2 transition-all select-none mr-3 flex items-center justify-center">
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
                        <div className="border-none bg-chart-1 pointer-events-none size-5 shrink-0 rounded-md transition-all select-none mr-3 flex items-center justify-center">
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
        />
      </div>
      <div className="w-full">
        <Button onClick={handleCreated} className="w-full cursor-pointer" variant="default">
          Création des groupes
        </Button>
      </div>
    </div>
  );
}
