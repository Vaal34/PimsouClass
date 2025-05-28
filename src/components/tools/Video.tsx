import { useState, useRef } from "react";
import { Resizable } from "react-resizable";
import { DraggableWrapper } from "../DndKitWrapper";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload, Link, X, Video as VideoIcon, Trash2, Loader2, Edit3, Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react";
import "react-resizable/css/styles.css";
import "./Picture.css";

// Types de vidéos supportées
type VideoType = 'file' | 'youtube' | 'vimeo' | 'dailymotion' | 'twitch' | 'direct';

interface VideoData {
  url: string;
  type: VideoType;
  embedUrl?: string;
}

// Fonctions utilitaires pour détecter et convertir les URLs
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getVimeoVideoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
};

const getDailymotionVideoId = (url: string): string | null => {
  const match = url.match(/dailymotion\.com\/video\/([^_]+)/);
  return match ? match[1] : null;
};

const getTwitchVideoId = (url: string): string | null => {
  const match = url.match(/twitch\.tv\/videos\/(\d+)/);
  return match ? match[1] : null;
};

const detectVideoType = (url: string): VideoData => {
  const cleanUrl = url.trim();
  
  // YouTube
  const youtubeId = getYouTubeVideoId(cleanUrl);
  if (youtubeId) {
    return {
      url: cleanUrl,
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0`
    };
  }
  
  // Vimeo
  const vimeoId = getVimeoVideoId(cleanUrl);
  if (vimeoId) {
    return {
      url: cleanUrl,
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`
    };
  }
  
  // Dailymotion
  const dailymotionId = getDailymotionVideoId(cleanUrl);
  if (dailymotionId) {
    return {
      url: cleanUrl,
      type: 'dailymotion',
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionId}`
    };
  }
  
  // Twitch
  const twitchId = getTwitchVideoId(cleanUrl);
  if (twitchId) {
    return {
      url: cleanUrl,
      type: 'twitch',
      embedUrl: `https://player.twitch.tv/?video=${twitchId}&parent=${window.location.hostname}&autoplay=false`
    };
  }
  
  // Vidéo directe (MP4, WebM, etc.)
  if (cleanUrl.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
    return {
      url: cleanUrl,
      type: 'direct'
    };
  }
  
  // Fichier uploadé ou autre
  return {
    url: cleanUrl,
    type: 'file'
  };
};

// Composant pour "Video Not Found"
const VideoNotFound = ({ width, height }: { width: number; height: number }) => (
  <div 
    className="flex flex-col items-center justify-center bg-gray-100"
    style={{ width, height: height - 60 }} // 60px pour la caption
  >
    <VideoIcon className="w-16 h-16 text-gray-400 mb-4" />
    <p className="text-gray-500 text-lg font-medium">Video Not Found</p>
    <p className="text-gray-400 text-sm mt-2">Cliquez sur les boutons ci-dessus</p>
    <p className="text-gray-400 text-sm">pour charger une vidéo</p>
    <p className="text-gray-400 text-xs mt-3">Formats supportés :</p>
    <p className="text-gray-400 text-xs">YouTube • Vimeo • Dailymotion • Twitch • MP4</p>
  </div>
);

export default function Video() {
  const [size, setSize] = useState({ width: 400, height: 350 });
  const [isResizing, setIsResizing] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [caption, setCaption] = useState("Vidéo");
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [tempCaption, setTempCaption] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onResize = (_event: any, { size }: { size: { width: number; height: number } }) => {
    setSize(size);
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeStop = () => {
    setIsResizing(false);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Vérification de la taille du fichier (max 100MB pour les vidéos)
      if (file.size > 100 * 1024 * 1024) {
        alert("Le fichier est trop volumineux. Taille maximale : 100MB");
        return;
      }
      
      setIsLoading(true);
      setVideoError(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setVideoData({
            url: e.target.result as string,
            type: 'file'
          });
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setVideoError(true);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Veuillez sélectionner un fichier vidéo valide");
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setIsLoading(true);
      setVideoError(false);
      
      const detectedVideo = detectVideoType(urlInput.trim());
      
      // Pour les plateformes d'hébergement, on peut directement utiliser l'embed
      if (detectedVideo.type !== 'file' && detectedVideo.type !== 'direct') {
        setVideoData(detectedVideo);
        setUrlInput("");
        setShowUrlInput(false);
        setIsLoading(false);
        return;
      }
      
      // Pour les vidéos directes, on teste le chargement
      if (detectedVideo.type === 'direct') {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          setVideoData(detectedVideo);
          setUrlInput("");
          setShowUrlInput(false);
          setIsLoading(false);
        };
        video.onerror = () => {
          setVideoError(true);
          setIsLoading(false);
        };
        video.src = detectedVideo.url;
      } else {
        // Fallback pour autres types
        setVideoData(detectedVideo);
        setUrlInput("");
        setShowUrlInput(false);
        setIsLoading(false);
      }
    }
  };

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
    if (e.key === 'Escape') {
      setShowUrlInput(false);
      setUrlInput("");
      setVideoError(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
    setUrlInput("");
    setVideoError(false);
  };

  const removeVideo = () => {
    setVideoData(null);
    setVideoError(false);
    setIsLoading(false);
    setIsPlaying(false);
  };

  const startEditingCaption = () => {
    setTempCaption(caption);
    setIsEditingCaption(true);
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

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const openInNewTab = () => {
    if (videoData?.url) {
      window.open(videoData.url, '_blank');
    }
  };

  const renderVideoContent = () => {
    if (!videoData) return null;

    const videoHeight = size.height - 60;

    // Vidéos intégrées (YouTube, Vimeo, etc.)
    if (videoData.embedUrl) {
      return (
        <div className="relative w-full bg-black flex items-center justify-center" style={{ height: videoHeight }}>
          <iframe
            src={videoData.embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={caption}
          />
          
          {/* Bouton pour ouvrir dans un nouvel onglet */}
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={openInNewTab}
              variant="noShadow"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onMouseDown={(e) => e.stopPropagation()}
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Vidéos directes ou fichiers uploadés
    return (
      <div className="relative w-full" style={{ height: videoHeight }}>
        <video
          ref={videoRef}
          src={videoData.url}
          className="w-full h-full object-contain bg-black"
          controls={false}
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoError(true)}
        />
        
        {/* Contrôles vidéo personnalisés pour les vidéos directes */}
        <div className="absolute bottom-2 left-2 flex gap-1 z-10">
          <Button
            onClick={togglePlayPause}
            variant="noShadow"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white"
            onMouseDown={(e) => e.stopPropagation()}
            title={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={toggleMute}
            variant="noShadow"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white"
            onMouseDown={(e) => e.stopPropagation()}
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Bouton pour ouvrir dans un nouvel onglet (vidéos directes) */}
        {videoData.type === 'direct' && (
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={openInNewTab}
              variant="noShadow"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white"
              onMouseDown={(e) => e.stopPropagation()}
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <DraggableWrapper
      id="video-item"
      initialPosition={{ x: 400, y: 200 }}
      className={`${isResizing ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <Resizable
        width={size.width}
        height={size.height}
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
        minConstraints={[300, 300]}
        maxConstraints={[1920, 1080]}
        resizeHandles={['se', 'e', 's']}
      >
        <div 
          style={{ width: size.width, height: size.height }}
          onMouseDown={(e) => {
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
            ) : videoData && !videoError ? (
              <figure
                className="overflow-hidden rounded-lg border-2 border-border bg-main font-base shadow-shadow h-full relative"
                style={{ width: size.width }}
              >
                {renderVideoContent()}

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
                    <div className="flex items-center justify-between w-full">
                      <span 
                        onDoubleClick={startEditingCaption}
                        className="cursor-pointer hover:bg-main/80 px-2 py-1 rounded flex-1 flex items-center gap-2"
                        title="Double-cliquez pour éditer"
                      >
                        {caption}
                        <Edit3 className="w-3 h-3 opacity-50" />
                      </span>
                      {videoData.type !== 'file' && (
                        <span className="text-xs text-main-foreground/60 capitalize bg-main/50 px-2 py-1 rounded">
                          {videoData.type}
                        </span>
                      )}
                    </div>
                  )}
                </figcaption>
              </figure>
            ) : (
              <figure
                className="overflow-hidden rounded-lg border-2 border-border bg-main font-base shadow-shadow h-full"
                style={{ width: size.width }}
              >
                <VideoNotFound width={size.width} height={size.height} />
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
                      {videoError ? "Erreur de chargement" : caption}
                      <Edit3 className="w-3 h-3 opacity-50" />
                    </span>
                  )}
                </figcaption>
              </figure>
            )}
            
            {/* Boutons de changement de vidéo */}
            <div className="absolute top-3 right-4 flex gap-3 z-10">
              <Button
                onClick={openFileDialog}
                variant="default"
                size="icon"
                onMouseDown={(e) => e.stopPropagation()}
                title="Charger depuis un fichier"
                aria-label="Charger une vidéo depuis un fichier"
                disabled={isLoading}
                className="bg-chart-4"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={toggleUrlInput}
                variant="default"
                size="icon"
                onMouseDown={(e) => e.stopPropagation()}
                title="Charger depuis une URL"
                aria-label="Charger une vidéo depuis une URL"
                disabled={isLoading}
                className="bg-chart-4"
              >
                <Link className="w-4 h-4" />
              </Button>

              {videoData && !isLoading && (
                <Button
                  onClick={removeVideo}
                  variant="neutral"
                  size="icon"
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Supprimer la vidéo"
                  aria-label="Supprimer la vidéo"
                  className="bg-chart-3 hover:bg-red-500 text-white"
                >
                  <Trash2 className="w-4 h-4" color="#000" />
                </Button>
              )}
            </div>

            {/* Input URL */}
            {showUrlInput && (
              <div className="absolute top-14 right-2 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-20 min-w-[300px]">
                <div className="flex gap-2 items-center">
                  <Input
                    type="url"
                    placeholder="YouTube, Vimeo, Dailymotion, Twitch ou URL directe..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={handleUrlKeyPress}
                    className="flex-1 text-sm"
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isLoading}
                    aria-label="URL de la vidéo"
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    size="sm"
                    variant="noShadow"
                    className="px-2 py-1 bg-chart-4 hover:bg-green-500 text-white border-green-600"
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
                    className="px-2 py-1 bg-chart-3"
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isLoading}
                    aria-label="Annuler"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {videoError && (
                  <p className="text-red-500 text-xs mt-1">
                    Impossible de charger la vidéo. Vérifiez l'URL.
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Exemples : youtube.com/watch?v=..., vimeo.com/..., dailymotion.com/video/...
                </div>
              </div>
            )}
            
            {/* Input file caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              aria-label="Sélectionner un fichier vidéo"
            />
          </div>
        </div>
      </Resizable>
    </DraggableWrapper>
  );
} 