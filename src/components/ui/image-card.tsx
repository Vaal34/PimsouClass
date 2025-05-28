import { cn } from "@/lib/utils"

type Props = {
  imageUrl: string
  caption: string
  className?: string
  width?: number
  height?: number
}

export default function ImageCard({ imageUrl, caption, className, width, height }: Props) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border-2 border-border bg-main font-base shadow-shadow h-full",
        className,
      )}
      style={{ width: width ? `${width}px` : '100%' }}
    >
      <img 
        className="w-full object-cover" 
        src={imageUrl} 
        alt="image"
        style={{ 
          height: height ? `${height - 60}px` : 'calc(100% - 60px)' // 60px pour la caption
        }}
        loading="lazy"
        decoding="async"
        fetchPriority="high"
      />
      <figcaption className="border-t-2 text-main-foreground border-border p-4 h-[60px] flex items-center">
        {caption}
      </figcaption>
    </figure>
  )
}
