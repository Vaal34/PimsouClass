import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { Slider } from "../ui/slider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Ruler, Trash2, EyeOff, Copy, Settings } from "lucide-react";
import { Textarea } from "../ui/textarea";

export default function Consigne() {
  const { state, setConsigne, resetConsigne } = useApp();
  const [inputValue, setInputValue] = useState("");
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number[]>([50]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setConsigne(inputValue.trim());
      setInputValue("");
    }
  };

  const handleReset = () => {
    resetConsigne();
    setInputValue("");
  };

  const handleToggleSlider = () => {
    setShowSlider(!showSlider);
  };

  const handleToggleButtons = () => {
    setShowButtons(!showButtons);
    if (!showButtons) {
      setShowSlider(false);
    }
  };

  // Calculer la largeur en pixels avec une plage plus large
  const boxWidth = `${200 + (sliderValue[0] / 100) * 1000}px`; // De 200px à 1200px

  if (state.isConsigneVisible && state.consigne) {
    return (
      <div
        className="gap-3 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: boxWidth,
          minWidth: "200px",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Context Menu sur la consigne */}
        <ContextMenu>
          <ContextMenuTrigger className="w-full">
            <p className="text-3xl text-gray-800 break-words overflow-wrap-anywhere leading-relaxed cursor-context-menu">
              {state.consigne}
            </p>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem
              onClick={handleToggleSlider}
              className="flex items-center gap-2"
            >
              <Ruler className="h-4 w-4" />
              {showSlider ? "Masquer" : "Ajuster"} la taille
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Réinitialiser
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={handleToggleButtons}
              className="flex items-center gap-2"
            >
              {showButtons ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Masquer les boutons
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Afficher les boutons
                </>
              )}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => navigator.clipboard.writeText(state.consigne)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copier le texte
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Boutons de contrôle (masquables) */}
        {showButtons && (
          <div className="gap-3 flex">
            <Button
              onClick={handleReset}
              variant="neutral"
              size="sm"
              className="self-start cursor-pointer"
            >
              Reset
            </Button>
            <Button
              onClick={handleToggleSlider}
              variant="neutral"
              size="sm"
              className="self-start cursor-pointer active:bg-main click"
            >
              Taille
            </Button>
          </div>
        )}

        {/* Slider (affiché conditionnellement) */}
        {showSlider && (
          <div className="space-y-2 p-3 bg-secondary-background border-2 border-border rounded-base">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Largeur:</span>
              <span className="text-sm bg-main px-2 py-1 rounded border-2 border-black text-black">
                {Math.round(200 + (sliderValue[0] / 100) * 1000)}px
              </span>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              min={10}
              step={1}
              className="w-full cursor-e-resize"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Étroit</span>
              <span>Large</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            id="consigne"
            placeholder="Écrivez votre consigne ici..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Entrez la consigne que vous souhaitez afficher
        </p>
        <Button type="submit">Soumettre</Button>
      </form>
    </div>
  );
}
