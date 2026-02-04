import {
  type RenderAdapter,
  type RenderContext
} from '../../core/platform/render-adapter';

export class Canvas2DRenderAdapter implements RenderAdapter {
  constructor(private ctx: CanvasRenderingContext2D) {}

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  scale(x: number, y: number): void {
    this.ctx.scale(x, y);
  }

  setStrokeStyle(color: string, width: number): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  beginPath(): void {
    this.ctx.beginPath();
  }

  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }

  stroke(): void {
    this.ctx.stroke();
  }

  setFillStyle(color: string): void {
    this.ctx.fillStyle = color;
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }

  arc(x: number, y: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
  }

  fill(): void {
    this.ctx.fill();
  }

  drawImage(image: any, x: number, y: number, width: number, height: number): void {
    this.ctx.drawImage(image, x, y, width, height);
  }

  getContext(): RenderContext {
    return {
      width: this.ctx.canvas.width,
      height: this.ctx.canvas.height
    };
  }
}
