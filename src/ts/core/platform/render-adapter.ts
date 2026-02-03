// Platform-agnostic rendering context
export interface RenderContext {
  width: number;
  height: number;
}

// Platform adapter interface for rendering operations
export interface RenderAdapter {
  // Canvas operations
  clear(): void;
  save(): void;
  restore(): void;

  // Transform operations
  translate(x: number, y: number): void;
  scale(x: number, y: number): void;

  // Drawing operations
  setStrokeStyle(color: string, width: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;

  // Fill operations
  setFillStyle(color: string): void;
  fillRect(x: number, y: number, width: number, height: number): void;

  // Arc operations (for debug points)
  arc(x: number, y: number, radius: number): void;
  fill(): void;

  // Image operations
  drawImage(image: any, x: number, y: number, width: number, height: number): void;

  // Get context dimensions
  getContext(): RenderContext;
}
