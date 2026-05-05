import { useState, useCallback } from 'react';

// Common App UI State
export function useAppUIState() {
  const [activeTab, setActiveTab] = useState<"scan" | "dashboard" | "sejarah">("scan");
  const [direction, setDirection] = useState(0);

  const handleTabChange = useCallback((newTab: "scan" | "dashboard" | "sejarah") => {
    const tabs: ("scan" | "dashboard" | "sejarah")[] = ["scan", "dashboard", "sejarah"];
    setActiveTab(prev => {
        const currentIndex = tabs.indexOf(prev);
        const nextIndex = tabs.indexOf(newTab);
        setDirection(nextIndex > currentIndex ? 1 : -1);
        return newTab;
    });
  }, []);

  const handleMainTabSwipe = useCallback((swipeDir: "left" | "right") => {
    const tabs: ("scan" | "dashboard" | "sejarah")[] = ["scan", "dashboard", "sejarah"];
    setActiveTab(prev => {
        const currentIndex = tabs.indexOf(prev);
        if (swipeDir === "left" && currentIndex < tabs.length - 1) {
            setDirection(1);
            return tabs[currentIndex + 1];
        } else if (swipeDir === "right" && currentIndex > 0) {
            setDirection(-1);
            return tabs[currentIndex - 1];
        }
        return prev;
    });
  }, []);

  return {
    activeTab, setActiveTab,
    direction, setDirection,
    handleTabChange,
    handleMainTabSwipe,
  };
}
