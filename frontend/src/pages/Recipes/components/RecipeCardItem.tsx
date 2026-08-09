import { motion } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { ShieldAlert } from 'lucide-react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Recipe } from '../../../types/recipe.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture.ts';

interface RecipeCardItemProps {
  recipe: Recipe;
  index: number;
  onSwipeLeft: (recipe: Recipe) => void;
  onSwipeRight: (id: string) => void;
  onCardClick: (recipe: Recipe) => void;
}

export function RecipeCardItem({ recipe, index, onSwipeLeft, onSwipeRight, onCardClick }: RecipeCardItemProps) {
  const isInactive = recipe.status === 'INACTIVE';
  const dragLimit = APP_CONFIG.recipes.interactions.swipeDragLimitPx;
  const gesture = useSwipeGesture({
    itemId: recipe.id,
    itemRef: recipe,
    onSwipeLeft,
    onSwipeRight,
    leftColor: isInactive ? '#10b981' : '#ef4444',
    actionThresholdPx: APP_CONFIG.recipes.interactions.swipeActionThresholdPx
  });

  const batchCost = recipe.product.recipeCostPerUnit * recipe.unitsPerBatch;

  return (
    <Draggable draggableId={recipe.id} index={index}>
      {(dragProvided, snapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          className={`${ERP_THEME.recipes.card.wrapper} ${snapshot.isDragging ? ERP_THEME.recipes.card.dragging : ''}`}
          data-ui-key={UI_KEYS.recipes.card}
        >
          <motion.div
            style={{ background: gesture.bgSwipe }}
            className={`${ERP_THEME.recipes.card.shell} ${isInactive ? ERP_THEME.recipes.card.inactive : ERP_THEME.recipes.card.active}`}
          >
            <div className="absolute inset-0 pointer-events-none flex items-center justify-end px-6 z-0 text-white font-bold text-xs w-full">
              <motion.div style={{ opacity: gesture.opacityLeft }} className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>{isInactive ? TEXTS.recipes.card.reactivate : TEXTS.recipes.card.deactivate}</span>
              </motion.div>
            </div>

            <motion.div
              drag="x"
              dragConstraints={{ left: -dragLimit, right: dragLimit }}
              dragElastic={{ left: 0.4, right: 0.4 }}
              dragSnapToOrigin={true}
              style={{ x: gesture.x }}
              onDragEnd={gesture.handleDragEnd}
              onPointerDown={() => gesture.setIsPressing(true)}
              onPointerUp={() => gesture.setIsPressing(false)}
              onClick={() => {
                if (Math.abs(gesture.x.get()) < 5) onCardClick(recipe);
              }}
              className={`${ERP_THEME.recipes.card.body} ${isInactive ? ERP_THEME.recipes.card.bodyInactive : ERP_THEME.recipes.card.bodyActive}`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-100 overflow-hidden shadow-3xs flex items-center justify-center shrink-0">
                {recipe.product.thumbnail ? (
                  <img src={recipe.product.thumbnail} alt={recipe.product.name} className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <span className="text-[9px] font-black text-white pointer-events-none">BOX</span>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1 pointer-events-none">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono tracking-tight font-black bg-indigo-50 text-indigo-700 border border-indigo-150 tabular-nums">
                    {recipe.product.sku}
                  </span>
                  {isInactive && (
                    <span className={ERP_THEME.recipes.card.inactiveBadge} data-ui-key={UI_KEYS.recipes.cardStatus}>
                      {TEXTS.recipes.card.inactiveBadge}
                    </span>
                  )}
                </div>
                <h3 className={`text-xs font-black leading-tight truncate mt-1.5 ${isInactive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {recipe.product.name}
                </h3>
              </div>

              <div className={ERP_THEME.recipes.card.metrics}>
                <div data-ui-key={UI_KEYS.recipes.cardBatchCost}>
                  <span className="text-slate-400 font-medium">{TEXTS.recipes.card.batchCost} </span>
                  <span className="text-slate-800 tabular-nums">{formatCurrencyBRL(batchCost)}</span>
                </div>
                <div className="w-px h-3 bg-slate-200 align-middle my-auto" />
                <div data-ui-key={UI_KEYS.recipes.cardUnitCost}>
                  <span className="text-slate-400 font-medium">{TEXTS.recipes.card.unitCost} </span>
                  <span className="text-indigo-600 tabular-nums">{formatCurrencyBRL(recipe.product.recipeCostPerUnit)}</span>
                </div>
                <div className="w-px h-3 bg-slate-200 align-middle my-auto" />
                <div data-ui-key={UI_KEYS.recipes.cardYield}>
                  <span className="text-slate-400 font-medium">{TEXTS.recipes.card.yield} </span>
                  <span className="text-slate-700 font-black tabular-nums">{recipe.unitsPerBatch} {TEXTS.recipes.page.unitSuffix}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
