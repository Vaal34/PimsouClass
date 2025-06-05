import { useState, useRef } from "react";
import { Resizable } from "react-resizable";
import { DraggableWrapper } from "../DndKitWrapper";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload, Link, X, ImageOff, Trash2, Loader2, Edit3 } from "lucide-react";
import "react-resizable/css/styles.css";
import "./Picture.css";

// Composant SVG pour "Image Not Found"
const ImageNotFound = ({ width, height }: { width: number; height: number }) => (
  <div 
    className="flex flex-col items-center justify-center bg-gray-100"
    style={{ width, height: height - 60 }} // 60px pour la caption
  >
    <ImageOff className="w-16 h-16 text-gray-400 mb-4" />
    <p className="text-gray-500 text-lg font-medium">Image Not Found</p>
    <p className="text-gray-400 text-sm mt-2">Cliquez sur les boutons ci-dessus</p>
    <p className="text-gray-400 text-sm">pour charger une image</p>
  </div>
);

export default function Picture() {
  const [size, setSize] = useState({ width: 300, height: 250 });
  const [isResizing, setIsResizing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [caption, setCaption] = useState("Image");
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [tempCaption, setTempCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  const onResize = (_event: any, { size }: { size: { width: number; height: number } }) => {
    setSize(size);
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeStop = () => {
    setIsResizing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setImageError(true);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Veuillez sélectionner un fichier image valide");
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setIsLoading(true);
      setImageError(false);
      
      // Créer une nouvelle image pour tester si l'URL est valide
      const img = new Image();
      img.onload = () => {
        setImageUrl(urlInput.trim());
        setUrlInput("");
        setShowUrlInput(false);
        setIsLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setIsLoading(false);
      };
      img.src = urlInput.trim();
    }
  };

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
    if (e.key === 'Escape') {
      setShowUrlInput(false);
      setUrlInput("");
      setImageError(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
    setUrlInput("");
    setImageError(false);
  };

  const removeImage = () => {
    setImageUrl("");
    setImageError(false);
    setIsLoading(false);
  };

  const startEditingCaption = () => {
    setTempCaption(caption);
    setIsEditingCaption(true);
    // Focus l'input après le rendu
    setTimeout(() => {
      captionInputRef.current?.focus();
      captionInputRef.current?.select();
    }, 0);
  };

  const saveCaption = () => {
    if (tempCaption.trim()) {
      setCaption(tempCaption.trim());
    }
    setIsEditingCaption(false);
    setTempCaption("");
  };

  const cancelEditingCaption = () => {
    setIsEditingCaption(false);
    setTempCaption("");
  };

  const handleCaptionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveCaption();
    }
    if (e.key === 'Escape') {
      cancelEditingCaption();
    }
  };

  return (
    <DraggableWrapper
      id="picture-item"
      initialPosition={{ x: 700, y: 200 }}
      className={`${isResizing ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <Resizable
        width={size.width}
        height={size.height}
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
        minConstraints={[300, 250]}
        maxConstraints={[2560, 1440]}
        resizeHandles={['se', 'e', 's']}
      >
        <div 
          style={{ width: size.width, height: size.height }}
          onMouseDown={(e) => {
            // Empêcher le drag si on clique sur une poignée de resize
            if ((e.target as HTMLElement).classList.contains('react-resizable-handle')) {
              e.stopPropagation();
            }
          }}
        >
          <div className="relative">
            {isLoading ? (
              <figure
                className="overflow-hidden rounded-lg border-2 border-border bg-main font-base shadow-shadow h-full flex items-center justify-center"
                style={{ width: size.width }}
              >
                <div className="flex flex-col items-center justify-center" style={{ height: size.height - 60 }}>
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Chargement...</p>
                </div>
                <figcaption className="absolute bottom-0 left-0 right-0 border-t-2 text-main-foreground border-border p-4 h-[60px] flex items-center bg-main">
                  {isEditingCaption ? (
                    <Input
                      ref={captionInputRef}
                      value={tempCaption}
                      onChange={(e) => setTempCaption(e.target.value)}
                      onKeyDown={handleCaptionKeyPress}
                      onBlur={saveCaption}
                      className="h-8 text-sm bg-white"
                      onMouseDown={(e) => e.stopPropagation()}
                      maxLength={50}
                    />
                  ) : (
                    <span 
                      onDoubleClick={startEditingCaption}
                      className="cursor-pointer hover:bg-main/80 px-2 py-1 rounded flex-1 flex items-center gap-2"
                      title="Double-cliquez pour éditer"
                    >
                      {caption}
                      <Edit3 className="w-3 h-3 opacity-50" />
                    </span>
                  )}
                </figcaption>
              </figure>
            ) : imageUrl && !imageError ? (
              <figure
                className="overflow-hidden rounded-lg border-2 border-border bg-main font-base shadow-shadow h-full"
                style={{ width: size.width }}
              >
                <img
                  src={imageUrl}
                  alt={caption}
                  className="w-full object-cover"
                  style={{ height: size.height - 60 }}
                />
                <figcaption className="border-t-2 text-main-foreground border-border p-4 h-[60px] flex items-center">
                  {isEditingCaption ? (
                    <Input
                      ref={captionInputRef}
                      value={tempCaption}
                      onChange={(e) => setTempCaption(e.target.value)}
                      onKeyDown={handleCaptionKeyPress}
                      onBlur={saveCaption}
                      className="h-8 text-sm bg-white"
                      onMouseDown={(e) => e.stopPropagation()}
                      maxLength={50}
                    />
                  ) : (
                    <span 
                      onDoubleClick={startEditingCaption}
                      className="cursor-pointer hover:bg-main/80 px-2 py-1 rounded flex-1 flex items-center gap-2"
                      title="Double-cliquez pour éditer"
                    >
                      {caption}
                      <Edit3 className="w-3 h-3 opacity-50" />
                    </span>
                  )}
                </figcaption>
              </figure>
            ) : (
              <figure
                className="overflow-hidden rounded-lg border-2 border-border bg-main font-base shadow-shadow h-full"
                style={{ width: size.width }}
              >
                <ImageNotFound width={size.width} height={size.height} />
                <figcaption className="border-t-2 text-main-foreground border-border p-4 h-[60px] flex items-center">
                  {isEditingCaption ? (
                    <Input
                      ref={captionInputRef}
                      value={tempCaption}
                      onChange={(e) => setTempCaption(e.target.value)}
                      onKeyDown={handleCaptionKeyPress}
                      onBlur={saveCaption}
                      className="h-8 text-sm bg-white"
                      onMouseDown={(e) => e.stopPropagation()}
                      maxLength={50}
                    />
                  ) : (
                    <span 
                      onDoubleClick={startEditingCaption}
                      className="cursor-pointer hover:bg-main/80 px-2 py-1 rounded flex-1 flex items-center gap-2"
                      title="Double-cliquez pour éditer"
                    >
                      {imageError ? "Erreur de chargement" : caption}
                      <Edit3 className="w-3 h-3 opacity-50" />
                    </span>
                  )}
                </figcaption>
              </figure>
            )}
            
            {/* Boutons de changement d'image */}
            <div className="absolute top-3 right-4 flex gap-3 z-10">
              <Button
                onClick={openFileDialog}
                variant="default"
                size="icon"
                onMouseDown={(e) => e.stopPropagation()}
                title="Charger depuis un fichier"
                aria-label="Charger une image depuis un fichier"
                disabled={isLoading}
                className="bg-chart-1"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={toggleUrlInput}
                variant="default"
                size="icon"
                onMouseDown={(e) => e.stopPropagation()}
                title="Charger depuis une URL"
                aria-label="Charger une image depuis une URL"
                disabled={isLoading}
                className="bg-chart-1"
              >
                <Link className="w-4 h-4" />
              </Button>

              {imageUrl && !isLoading && (
                <Button
                  onClick={removeImage}
                  variant="neutral"
                  size="icon"
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Supprimer l'image"
                  aria-label="Supprimer l'image"
                  className="bg-chart-3 hover:bg-red-500 text-white"
                >
                  <Trash2 className="w-4 h-4" color="#000" />
                </Button>
              )}
            </div>

            {/* Input URL */}
            {showUrlInput && (
              <div className="absolute top-14 right-2 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-20 min-w-[250px]">
                <div className="flex gap-2 items-center">
                  <Input
                    type="url"
                    placeholder="https://exemple.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={handleUrlKeyPress}
                    className="flex-1 text-sm"
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isLoading}
                    aria-label="URL de l'image"
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    size="sm"
                    variant="noShadow"
                    className="cursor-pointer px-2 py-1 bg-green-500 text-green-800 border-green-400 hover:active:bg-green-600"
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isLoading || !urlInput.trim()}
                    aria-label="Valider l'URL"
                  >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
                  </Button>
                  <Button
                    onClick={toggleUrlInput}
                    size="sm"
                    variant="noShadow"
                    className="cursor-pointer px-2 py-1 bg-red-500 border-black hover:active:bg-red-600"
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isLoading}
                    aria-label="Annuler"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {imageError && (
                  <p className="text-red-500 text-xs mt-1">
                    Impossible de charger l'image. Vérifiez l'URL.
                  </p>
                )}
              </div>
            )}
            
            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Sélectionner un fichier image"
            />
          </div>
        </div>
      </Resizable>
    </DraggableWrapper>
  );
}
