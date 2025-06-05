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

function App() {
  return (
    <SidebarProvider>
      <AddTools />
      <SidebarInset>
        <div className="absolute top-5 left-5">
          <SidebarTrigger />
        </div>
        <div className="h-screen w-full p-8 relative wallpaper">
          <DndKitWrapper>
            <DraggableItem
              id="item-2"
              title="Consigne"
              initialPosition={{ x: 400, y: 200 }}
              autoResize={true}
              minWidth="200px"
              maxWidth="1300px"
              className="p-6"
            >
              <Consigne />
            </DraggableItem>
            <Picture />
            <Video />
            <DraggableItem
              id="item-1"
              title="Timer"
              initialPosition={{ x: 800, y: 400 }}
              autoResize={true}
              minWidth="200px"
              maxWidth="1300px"
              className="p-6"
            >
              <Timer />
            </DraggableItem>
            <DraggableItem
              id="item-3"
              title="Groupe"
              initialPosition={{ x: 400, y: 200 }}
              autoResize={true}
              minWidth="200px"
              maxWidth="1300px"
              className="p-6"
            >
              <Groupe />
            </DraggableItem>
          </DndKitWrapper>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
