import { renderBackgroundLayer } from '../core/canvas/background-layer';
import { renderStrokeLayer } from '../core/canvas/stroke-layer';

export class CanvasManager {
  private backgroundCanvas: HTMLCanvasElement;
  private strokeCanvas: HTMLCanvasElement;
  private backgroundCtx: CanvasRenderingContext2D;
  private strokeCtx: CanvasRenderingContext2D;

  constructor() {
    this.backgroundCanvas = document.querySelector(
      'canvas.background'
    ) as HTMLCanvasElement;
    this.strokeCanvas = document.querySelector(
      'canvas.stroke'
    ) as HTMLCanvasElement;

    this.backgroundCtx = this.backgroundCanvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })!;

    this.strokeCtx = this.strokeCanvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    })!;

    if (!this.backgroundCtx || !this.strokeCtx) {
      throw new Error('Failed to get canvas contexts');
    }

    this.backgroundCtx.fillStyle = '#ffffff';
    this.backgroundCtx.fillRect(
      0,
      0,
      this.backgroundCanvas.width,
      this.backgroundCanvas.height
    );

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.backgroundCanvas.width = width;
    this.backgroundCanvas.height = height;
    this.strokeCanvas.width = width;
    this.strokeCanvas.height = height;

    this.backgroundCtx.fillStyle = '#ffffff';
    this.backgroundCtx.fillRect(0, 0, width, height);

    // Only render if we're not in initial construction
    // (platform needs to be initialized first)
    if ((window as any).__platformInitialized) {
      this.renderAll();
    }
  }

  public renderAll(): void {
    renderBackgroundLayer();
    renderStrokeLayer();
  }

  public getBackgroundContext(): CanvasRenderingContext2D {
    return this.backgroundCtx;
  }

  public getStrokeContext(): CanvasRenderingContext2D {
    return this.strokeCtx;
  }
}

export let canvasManager: CanvasManager;

export function initCanvasManager(): CanvasManager {
  canvasManager = new CanvasManager();
  return canvasManager;
}
