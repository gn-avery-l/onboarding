import { type InputAdapter } from './input-adapter';
import { type RenderAdapter } from './render-adapter';
import { type SchedulerAdapter } from './scheduler-adapter';

export interface PlatformContext {
  input: InputAdapter;
  scheduler: SchedulerAdapter;
  backgroundRenderer: RenderAdapter;
  strokeRenderer: RenderAdapter;
}

let platformContext: PlatformContext | null = null;

export function initPlatform(context: PlatformContext): void {
  platformContext = context;
}

export function getPlatform(): PlatformContext {
  if (!platformContext) {
    throw new Error('Platform not initialized. Call initPlatform first.');
  }
  return platformContext;
}
