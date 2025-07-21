export type TimelineStep = 
  | 'countdown_3' 
  | 'countdown_2'
  | 'countdown_1'
  | 'scanning'
  | 'result_display';

export interface TimelineState {
  currentStep: TimelineStep;
  cycleStats: string[];
  willBeMogging: boolean;
}
