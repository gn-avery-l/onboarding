import '../styles/global.css';

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');

  if (main) {
    main.addEventListener('click', (event: MouseEvent) => {
      const { tagName } = event.target as HTMLElement;

      if (tagName === 'BUTTON') {
        console.log('Clicked!')
      }
    });
  }
});
