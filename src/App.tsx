import { DndKitWrapper, DraggableItem } from "@/components/DndKitWrapper";
import Consigne from "@/components/tools/Consigne";
import Picture from "./components/tools/Picture";
import Video from "./components/tools/Video";
import { AddTools } from "./components/AddTools";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Timer from "./components/tools/Chronometre";
import Groupe from "./components/tools/Groupe";
import { useState } from "react";

const toolsConfig = {
  timer: {
    component: Timer,
    title: "Timer",
    isDraggable: true,
    position: { x: 300, y: 100 },
  },
  consigne: {
    component: Consigne,
    title: "Consigne",
    isDraggable: true,
    position: { x: 700, y: 100 },
  },
  photo: {
    component: Picture,
    title: "Photo",
    isDraggable: false,
    position: { x: 600, y: 100 },
  },
  vidéo: {
    component: Video,
    title: "Vidéo",
    isDraggable: false,
    position: { x: 700, y: 100 },
  },
  groupe: {
    component: Groupe,
    title: "Groupe",
    isDraggable: true,
    position: { x: 1200, y: 100 },
  },
};

function App() {
  const [activeTools, setActiveTools] = useState([]);

  return (
    <SidebarProvider>
      <AddTools setActiveTools={setActiveTools} />
      <SidebarInset>
        <div className="absolute top-5 left-5">
          <SidebarTrigger />
        </div>
        <div className="h-screen w-full p-8 relative wallpaper">
          <DndKitWrapper>
            {activeTools.map((toolName: string, index: number) => {
              const toolKey =
                toolName.toLowerCase() as keyof typeof toolsConfig;
              const toolConfig = toolsConfig[toolKey];

              if (!toolConfig) return null;

              const ToolComponent = toolConfig.component;

              if (toolConfig.isDraggable) {
                return (
                  <DraggableItem
                    key={`${toolName}-${index}`}
                    id={`${toolName}-${index}`}
                    title={toolConfig.title}
                    initialPosition={toolConfig.position}
                  >
                    <ToolComponent key={`${toolName}-${index}`} />
                  </DraggableItem>
                );
              } else {
                // Pour les composants non-draggables qui utilisent DraggableWrapper en interne
                return (
                  <ToolComponent 
                    key={`${toolName}-${index}`}
                    id={`${toolName}-${index}`}
                    initialPosition={toolConfig.position}
                  />
                );
              }
            })}
          </DndKitWrapper>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
