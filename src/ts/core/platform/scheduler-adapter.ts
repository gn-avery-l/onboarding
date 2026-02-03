// Platform adapter interface for animation frame scheduling
export interface SchedulerAdapter {
  scheduleRender(callback: () => void): void;
}
