import { type SchedulerAdapter } from '../../core/platform/scheduler-adapter';

export class BrowserSchedulerAdapter implements SchedulerAdapter {
  scheduleRender(callback: () => void): void {
    requestAnimationFrame(callback);
  }
}
