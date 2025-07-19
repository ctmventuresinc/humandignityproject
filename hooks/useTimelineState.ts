import { useState, useCallback } from 'react';
import { TimelineStep, TimelineState } from '../types/timeline';

const objectiveBad = [
  "weak chin", "receding hairline", "predator eyes", "bad skin", "weak jawline"
];

const funnyBad = [
  "no sex appeal", "watches ig reels", "social anxiety", 
  "incel", "uses hinge",
];

const objectiveGood = [
  "jaw dominance", "hunter eyes", "bone structure", "nice nose", "golden ratio", 
  "cheekbones", "jaw angle", "chad energy",
];

const funnyGood = [
  "has 401k",  "has sex", "fucks", "doesnt listen to travis scott",
  "alpha vibes", "aura", "rizz", "gyatt", "potentially gay", "zesty", "voted for zohran"
];

// Generate random stat with number between 1-9
const generateStat = (category: string, isPositive: boolean, seed: number) => {
  const randomNum = (seed % 9) + 1; // 1-9
  const sign = isPositive ? "+" : "-";
  return `${sign}${randomNum} ${category}`;
};

export const useTimelineState = () => {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentStep: 'waiting',
    cycleStats: [],
    willBeMogging: false
  });

  const nextStep = useCallback(() => {
    setTimelineState(prev => {
      let nextStep: TimelineStep;
      
      switch (prev.currentStep) {
        case 'waiting':
          nextStep = 'countdown_3';
          break;
        case 'countdown_3':
          nextStep = 'countdown_2';
          break;
        case 'countdown_2':
          nextStep = 'countdown_1';
          break;
        case 'countdown_1':
          nextStep = 'scanning';
          break;
        case 'scanning':
          nextStep = 'calculating';
          break;
        case 'calculating':
          nextStep = 'result_display';
          break;
        case 'result_display':
          nextStep = 'waiting_for_input';
          break;
        case 'waiting_for_input':
          nextStep = 'waiting';
          break;
        default:
          nextStep = 'waiting';
      }

      // Generate stats when moving to calculating step
      let newStats = prev.cycleStats;
      let willBeMogging = prev.willBeMogging;
      
      if (nextStep === 'calculating') {
        willBeMogging = Math.random() > 0.5;
        
        if (willBeMogging) {
          // 2 from objectiveGood + 1 from funnyGood
          const obj1 = objectiveGood[Math.floor(Math.random() * objectiveGood.length)];
          const obj2 = objectiveGood[Math.floor(Math.random() * objectiveGood.length)];
          const funny1 = funnyGood[Math.floor(Math.random() * funnyGood.length)];
          
          newStats = [
            generateStat(obj1, true, Math.floor(Math.random() * 1000)),
            generateStat(obj2, true, Math.floor(Math.random() * 1000)),
            generateStat(funny1, true, Math.floor(Math.random() * 1000))
          ];
        } else {
          // 2 from funnyBad + 1 from objectiveBad
          const funny1 = funnyBad[Math.floor(Math.random() * funnyBad.length)];
          const funny2 = funnyBad[Math.floor(Math.random() * funnyBad.length)];
          const obj1 = objectiveBad[Math.floor(Math.random() * objectiveBad.length)];
          
          newStats = [
            generateStat(funny1, false, Math.floor(Math.random() * 1000)),
            generateStat(funny2, false, Math.floor(Math.random() * 1000)),
            generateStat(obj1, false, Math.floor(Math.random() * 1000))
          ];
        }
      }

      const newState = {
        currentStep: nextStep,
        cycleStats: newStats,
        willBeMogging
      };

      // Update localStorage for BoundingBox component
      window.localStorage.setItem("timelineState", JSON.stringify(newState));
      window.localStorage.setItem("currentCycleStats", JSON.stringify(newStats));

      return newState;
    });
  }, []);

  const resetTimeline = useCallback(() => {
    const initialState = {
      currentStep: 'waiting' as TimelineStep,
      cycleStats: [],
      willBeMogging: false
    };
    setTimelineState(initialState);
    window.localStorage.setItem("timelineState", JSON.stringify(initialState));
  }, []);

  return {
    timelineState,
    nextStep,
    resetTimeline
  };
};
