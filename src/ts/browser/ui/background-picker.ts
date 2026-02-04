import { state } from '../../core/state';
import { renderBackgroundLayer } from '../../core/canvas/background-layer';
import { type BackgroundImage } from '../../core/types';

export class BackgroundPicker {
  private backgroundUrls: Record<string, string> = {
    nature: 'https://picsum.photos/seed/nature/800/600',
    abstract: 'https://picsum.photos/seed/abstract/800/600',
    city: 'https://picsum.photos/seed/city/800/600',
    pattern: 'https://picsum.photos/seed/pattern/800/600',
    texture: 'https://picsum.photos/seed/texture/800/600'
  };

  constructor() {
    const buttons = document.querySelectorAll('.background-option');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const bgType = button.getAttribute('data-bg');

        if (bgType === 'blank') {
          state.background.currentBackground = null;
          renderBackgroundLayer();
        } else if (bgType && this.backgroundUrls[bgType]) {
          this.loadBackground(bgType, this.backgroundUrls[bgType]);
        }
      });
    });
  }

  private loadBackground(name: string, url: string): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const bgImage: BackgroundImage = {
        id: name.toLowerCase(),
        url,
        thumbnail: url,
        loaded: true,
        image: img
      };
      state.background.currentBackground = bgImage;
      renderBackgroundLayer();
    };
    img.src = url;
  }
}
