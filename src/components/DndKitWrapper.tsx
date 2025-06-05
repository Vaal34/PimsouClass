import React, { useState } from 'react';
import type { ReactNode } from 'react';
import {
  DndContext,
  useDraggable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './ui/card';
import { Button } from './ui/button';

// Interface pour la position
interface Position {
  x: number;
  y: number;
}

// Interface pour les props du DraggableItem (version flexible)
interface DraggableItemProps {
  id: string;
  title?: string;
  children: ReactNode;
  initialPosition?: Position;
  className?: string;
  showGrip?: boolean; // Optionnel : afficher ou non la poignée
  minWidth?: string; // Largeur minimale personnalisable
  maxWidth?: string; // Largeur maximale personnalisable
  autoResize?: boolean; // Nouveau : redimensionnement automatique
  width?: string; // Largeur fixe optionnelle
}

// Interface pour les props du DraggableWrapper (version minimaliste)
interface DraggableWrapperProps {
  id: string;
  children: ReactNode;
  initialPosition?: Position;
  className?: string;
}

// Interface pour l'état des éléments
interface DraggableElement {
  id: string;
  position: Position;
}

// Hook personnalisé pour gérer les positions des éléments
const useDraggablePositions = (initialElements: DraggableElement[] = []) => {
  const [elements, setElements] = useState<Record<string, Position>>(() => {
    return initialElements.reduce((acc, element) => {
      acc[element.id] = element.position;
      return acc;
    }, {} as Record<string, Position>);
  });

  // Mettre à jour les positions si de nouveaux éléments sont ajoutés
  React.useEffect(() => {
    setElements(prevElements => {
      const newElements = initialElements.reduce((acc, element) => {
        // Garder la position existante si elle existe, sinon utiliser la position initiale
        acc[element.id] = prevElements[element.id] || element.position;
        return acc;
      }, {} as Record<string, Position>);
      
      // Vérifier s'il y a vraiment des changements
      const hasChanges = initialElements.some(element => 
        !prevElements[element.id]
      );
      
      return hasChanges ? newElements : prevElements;
    });
  }, [initialElements]);

  const updatePosition = (id: string, position: Position) => {
    setElements(prev => ({
      ...prev,
      [id]: position
    }));
  };

  const getPosition = (id: string): Position => {
    return elements[id] || { x: 0, y: 0 };
  };

  return { elements, updatePosition, getPosition };
};

// Composant DraggableItem (avec titre et poignée)
export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  title,
  children,
  initialPosition = { x: 0, y: 0 },
  className = '',
  showGrip = true,
  minWidth = '300px',
  maxWidth = '500px',
  autoResize = false,
  width
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: {
      type: 'draggable-item',
      initialPosition,
    },
  });

  // Récupérer la position depuis le contexte parent
  const contextPositions = React.useContext(PositionContext);
  const position = contextPositions?.[id] ?? initialPosition;

  // Logique de style adaptée au redimensionnement
  const style = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    zIndex: isDragging ? 1000 : 1,
    transform: CSS.Translate.toString(transform),
    // Gestion conditionnelle de la largeur
    ...(autoResize 
      ? {
          width: 'fit-content',
          minWidth: minWidth,
          maxWidth: maxWidth,
        }
      : width 
        ? { width }
        : {
            minWidth,
            maxWidth,
          }
    ),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        rounded-lg shadow-lg p-4 bg-chart-4
        ${isDragging ? 'shadow-2xl' : 'shadow-lg'}
        ${autoResize ? 'w-fit' : ''}
        ${className}
      `}
      {...attributes}
    >
      {(title || showGrip) && (
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-2xl font-black text-black whitespace-nowrap">{title}</h3>
          )}
          {showGrip && (
            <Button
              variant="reverse"
              ref={setActivatorNodeRef}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 rounded transition-colors flex-shrink-0 bg-secondary-background"
              aria-label="Glisser pour déplacer"
            >
              <GripVertical className="w-5 h-5 text-black" />
            </Button>
          )}
        </div>
      )}
      <div className={title || showGrip ? "text-gray-700" : ""}>
        {children}
      </div>
    </Card>
  );
};

// Composant DraggableWrapper (version minimaliste - juste un wrapper draggable)
export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  id,
  children,
  initialPosition = { x: 0, y: 0 },
  className = ''
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: {
      type: 'draggable-wrapper',
      initialPosition,
    },
  });

  // Récupérer la position depuis le contexte parent
  const contextPositions = React.useContext(PositionContext);
  const position = contextPositions?.[id] ?? initialPosition;

  const style = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    zIndex: isDragging ? 1000 : 1,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-move ${className}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

// Contexte pour partager les positions
const PositionContext = React.createContext<Record<string, Position> | null>(null);

// Props du DndKitWrapper
interface DndKitWrapperProps {
  children: ReactNode;
}

// Modifier personnalisé pour limiter au viewport
const restrictToViewportBounds = ({ transform, draggingNodeRect }: any) => {
  if (!draggingNodeRect) {
    return transform;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculer les limites en prenant en compte la taille de l'élément
  const minX = -draggingNodeRect.left;
  const maxX = viewportWidth - draggingNodeRect.right;
  const minY = -draggingNodeRect.top;
  const maxY = viewportHeight - draggingNodeRect.bottom;
  
  return {
    ...transform,
    x: Math.min(Math.max(transform.x, minX), maxX),
    y: Math.min(Math.max(transform.y, minY), maxY),
  };
};

// Composant principal DndKitWrapper
export const DndKitWrapper: React.FC<DndKitWrapperProps> = ({ children }) => {
  const [_activeId, setActiveId] = useState<string | null>(null);
  const [_draggedElement, setDraggedElement] = useState<React.ReactElement | null>(null);

  // Extraire les positions initiales des enfants
  const initialElements = React.useMemo(() => {
    return React.Children.toArray(children)
      .filter((child): child is React.ReactElement<any> => 
        React.isValidElement(child) && 
        typeof child.type !== 'string' &&
        ((child.props as any)?.id !== undefined)
      )
      .map(child => ({
        id: (child.props as any).id,
        position: (child.props as any).initialPosition || { x: 0, y: 0 }
      }));
  }, [children]);

  const { elements, updatePosition } = useDraggablePositions(initialElements);

  // Configuration des capteurs
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 8,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Gestionnaire de début de glissement
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Trouver l'élément React correspondant
    const activeElement = React.Children.toArray(children)
      .filter((child): child is React.ReactElement<any> => 
        React.isValidElement(child) && 
        typeof child.type !== 'string' &&
        (child.props as any)?.id !== undefined
      )
      .find(child => (child.props as any).id === active.id);
    
    setDraggedElement(activeElement || null);
  };

  // Gestionnaire de fin de glissement
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (active && delta) {
      const activeId = active.id as string;
      const currentPosition = elements[activeId];
      
      // Si la position actuelle n'existe pas, utiliser la position initiale de l'élément
      let startPosition = currentPosition;
      if (!startPosition) {
        const initialElement = initialElements.find(el => el.id === activeId);
        startPosition = initialElement?.position || { x: 0, y: 0 };
      }
      
      const tentativePosition = {
        x: startPosition.x + delta.x,
        y: startPosition.y + delta.y,
      };
      
      // Contraindre la position finale dans les limites du viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Estimer la taille de l'élément (par défaut, on suppose une taille raisonnable)
      const estimatedWidth = 400; // Largeur estimée
      const estimatedHeight = 300; // Hauteur estimée
      
      const newPosition = {
        x: Math.min(Math.max(0, tentativePosition.x), viewportWidth - estimatedWidth),
        y: Math.min(Math.max(0, tentativePosition.y), viewportHeight - estimatedHeight),
      };
      
      updatePosition(activeId, newPosition);
    }

    setActiveId(null);
    setDraggedElement(null);
  };

  return (
    <PositionContext.Provider value={elements}>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToViewportBounds]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    </PositionContext.Provider>
  );
};

 