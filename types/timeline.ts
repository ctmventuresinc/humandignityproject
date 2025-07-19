export type TimelineStep = 
  | 'waiting'
  | 'countdown_3' 
  | 'countdown_2'
  | 'countdown_1'
  | 'scanning'
  | 'calculating'
  | 'result_display'
  | 'waiting_for_input';

export interface TimelineState {
  currentStep: TimelineStep;
  cycleStats: string[];
  willBeMogging: boolean;
}
