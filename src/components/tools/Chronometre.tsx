import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Play, Pause, RotateCcw, Clock, Settings, EyeOff, Bolt } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function Chronometre() {
  const [time, setTime] = useState(300); // 5 minutes par défaut
  const [initialTime, setInitialTime] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [showQuickButtons, setShowQuickButtons] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const addTime = (seconds: number) => {
    setTime((prev) => Math.max(0, prev + seconds));
    if (!isRunning && time === 0) {
      setTime(seconds);
    }
  };

  const startEditingTime = () => {
    setTempTime(Math.floor(time / 60).toString());
    setIsEditingTime(true);
    setTimeout(() => {
      timeInputRef.current?.focus();
      timeInputRef.current?.select();
    }, 0);
  };

  const saveTime = () => {
    const minutes = parseInt(tempTime) || 0;
    const newTime = minutes * 60;
    setTime(newTime);
    setInitialTime(newTime);
    setIsEditingTime(false);
    setTempTime("");
  };

  const cancelEditingTime = () => {
    setIsEditingTime(false);
    setTempTime("");
  };

  const handleTimeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTime();
    }
    if (e.key === "Escape") {
      cancelEditingTime();
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) {
      setShowQuickButtons(false);
    }
  };

  const toggleQuickButtons = () => {
    setShowQuickButtons(!showQuickButtons);
  };

  // Couleur dynamique basée sur le temps restant
  const getTimerColor = () => {
    const ratio = time / initialTime;
    if (ratio > 0.5) return "text-chart-1";
    if (ratio > 0.25) return "text-chart-2";
    return "text-chart-3";
  };

  return (
    <div
      className="gap-3 flex flex-col transition-all duration-300 ease-in-out max-w-md w-full"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Affichage principal du timer avec menu contextuel */}
      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          <div className="text-center cursor-context-menu bg-secondary-background border-border border-2 rounded-lg">
            {isEditingTime ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  ref={timeInputRef}
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  onKeyDown={handleTimeKeyPress}
                  onBlur={saveTime}
                  className="w-20 h-12 text-center text-2xl font-heading"
                  placeholder="Min"
                  type="number"
                  min="0"
                  max="999"
                />
                <span className="text-sm text-text">minutes</span>
              </div>
            ) : (
              <div onClick={startEditingTime} className="cursor-pointer hover:bg-gray-50 p-6 rounded-base transition-colors">
                <div className={`text-6xl font-black text-stroke-brutal ${getTimerColor()}`}>
                  {formatTime(time)}
                </div>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={toggleQuickButtons}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            {showQuickButtons ? "Masquer" : "Afficher"} ajouts rapides
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={resetTimer}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={toggleControls}
            className="flex items-center gap-2"
          >
            {showControls ? (
              <>
                <EyeOff className="h-4 w-4" />
                Masquer les contrôles
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                Afficher les contrôles
              </>
            )}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Contrôles principaux (masquables) */}
      {showControls && (
        <div className="gap-3 flex justify-between">
          <Button
            onClick={toggleTimer}
            variant="default"
            size="sm"
            disabled={time === 0 && !isRunning}
            className="bg-chart-1 cursor-pointer w-[100px]"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </Button>

          <Button
            onClick={resetTimer}
            variant="neutral"
            size="sm"
            className="cursor-pointer w-[100px]"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <Button
            onClick={toggleQuickButtons}
            variant="neutral"
            size="sm"
            className="cursor-pointer bg-chart-5"
          >
            <Bolt />
          </Button>
        </div>
      )}

      {/* Boutons d'ajout rapide (affichés conditionnellement) */}
      {showQuickButtons && (
        <div className="space-y-2 p-3 bg-secondary-background border-2 border-border rounded-base">
          <div className="text-sm font-medium text-center mb-2">Ajouts rapides</div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => addTime(60)}
              variant="noShadow"
              size="sm"
              className="bg-chart-1 text-xs cursor-pointer"
            >
              +1min
            </Button>
            <Button
              onClick={() => addTime(300)}
              variant="noShadow"
              size="sm"
              className="bg-chart-5 text-xs cursor-pointer"
            >
              +5min
            </Button>
            <Button
              onClick={() => addTime(600)}
              variant="noShadow"
              size="sm"
              className="bg-chart-1 text-xs cursor-pointer"
            >
              +10min
            </Button>
          </div>
          <div className="flex gap-2 justify-center mt-2">
            <Button
              onClick={() => addTime(-60)}
              variant="noShadow"
              size="sm"
              className="bg-chart-3 text-xs cursor-pointer"
              disabled={time < 60}
            >
              -1min
            </Button>
            <Button
              onClick={() => addTime(-300)}
              variant="noShadow"
              size="sm"
              className="bg-chart-3 text-xs cursor-pointer"
              disabled={time < 300}
            >
              -5min
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
