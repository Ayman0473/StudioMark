import { useState, useCallback, useRef, useEffect } from 'react';
import { PlacementConfig } from '../types/mockup';

interface UsePlacementHistoryOptions {
  maxHistory?: number;
}

export function usePlacementHistory(
  initialConfig: PlacementConfig,
  options: UsePlacementHistoryOptions = {}
) {
  const { maxHistory = 50 } = options;

  // History stack with pointer
  const [history, setHistory] = useState<PlacementConfig[]>([initialConfig]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Reference to current active config for non-committed intermediate updates
  const activeConfigRef = useRef<PlacementConfig>(initialConfig);
  activeConfigRef.current = history[currentIndex] || initialConfig;

  // Snapshot before interaction started (e.g. before drag or slider movement)
  const interactionStartConfigRef = useRef<PlacementConfig | null>(null);

  /**
   * Called when an interaction starts (e.g. mouse down on canvas or slider focus/pointerdown)
   */
  const beginInteraction = useCallback(() => {
    interactionStartConfigRef.current = { ...activeConfigRef.current };
  }, []);

  /**
   * Commit a new configuration to the undo/redo stack
   */
  const pushState = useCallback(
    (newConfig: PlacementConfig) => {
      setHistory((prev) => {
        // Discard any future history beyond current index
        const trimmed = prev.slice(0, currentIndex + 1);

        // Don't push if it is identical in placement attributes
        const current = trimmed[trimmed.length - 1];
        if (
          current &&
          current.xOffset === newConfig.xOffset &&
          current.yOffset === newConfig.yOffset &&
          current.scale === newConfig.scale &&
          current.rotation === newConfig.rotation &&
          current.opacity === newConfig.opacity &&
          current.blendMode === newConfig.blendMode &&
          current.finish === newConfig.finish &&
          current.selectedColor === newConfig.selectedColor &&
          current.curvatureIntensity === newConfig.curvatureIntensity &&
          current.layerFilter === newConfig.layerFilter &&
          current.filterIntensity === newConfig.filterIntensity
        ) {
          return prev;
        }

        const next = [...trimmed, newConfig];
        if (next.length > maxHistory) {
          return next.slice(next.length - maxHistory);
        }
        return next;
      });

      setCurrentIndex((prev) => {
        const nextIndex = Math.min(prev + 1, maxHistory - 1);
        return nextIndex;
      });
      interactionStartConfigRef.current = null;
    },
    [currentIndex, maxHistory]
  );

  /**
   * Live update without committing immediately to history (e.g., during active dragging)
   */
  const updateLive = useCallback(
    (newConfig: PlacementConfig) => {
      setHistory((prev) => {
        const updated = [...prev];
        updated[currentIndex] = newConfig;
        return updated;
      });
    },
    [currentIndex]
  );

  /**
   * Finish an interaction and commit if changed
   */
  const endInteraction = useCallback(
    (finalConfig?: PlacementConfig) => {
      const configToCommit = finalConfig || activeConfigRef.current;
      const startConfig = interactionStartConfigRef.current;

      if (startConfig) {
        // Check if anything actually changed
        const hasChanged =
          startConfig.xOffset !== configToCommit.xOffset ||
          startConfig.yOffset !== configToCommit.yOffset ||
          startConfig.scale !== configToCommit.scale ||
          startConfig.rotation !== configToCommit.rotation ||
          startConfig.layerFilter !== configToCommit.layerFilter ||
          startConfig.filterIntensity !== configToCommit.filterIntensity;

        if (hasChanged) {
          // Put the start config at currentIndex, then push the finalConfig
          setHistory((prev) => {
            const base = prev.slice(0, currentIndex);
            const next = [...base, startConfig, configToCommit];
            if (next.length > maxHistory) {
              return next.slice(next.length - maxHistory);
            }
            return next;
          });
          setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
        }
      } else {
        // If no interaction was formally begun, push directly if different
        pushState(configToCommit);
      }
      interactionStartConfigRef.current = null;
    },
    [currentIndex, maxHistory, pushState]
  );

  /**
   * Undo to previous placement
   */
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      interactionStartConfigRef.current = null;
    }
  }, [currentIndex]);

  /**
   * Redo to next placement
   */
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      interactionStartConfigRef.current = null;
    }
  }, [currentIndex, history.length]);

  /**
   * Reset stack with a new base configuration (e.g., when switching products)
   */
  const resetStack = useCallback((newBaseConfig: PlacementConfig) => {
    setHistory([newBaseConfig]);
    setCurrentIndex(0);
    interactionStartConfigRef.current = null;
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Global keyboard shortcuts (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            // Cmd+Shift+Z or Ctrl+Shift+Z -> Redo
            e.preventDefault();
            if (canRedo) redo();
          } else {
            // Cmd+Z or Ctrl+Z -> Undo
            e.preventDefault();
            if (canUndo) undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          // Ctrl+Y or Cmd+Y -> Redo
          e.preventDefault();
          if (canRedo) redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return {
    config: history[currentIndex] || initialConfig,
    canUndo,
    canRedo,
    undo,
    redo,
    undoCount: currentIndex,
    redoCount: history.length - 1 - currentIndex,
    pushState,
    updateLive,
    beginInteraction,
    endInteraction,
    resetStack,
  };
}
