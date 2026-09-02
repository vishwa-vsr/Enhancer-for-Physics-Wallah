import { getActiveVideo } from '../video/detector';

let toastTimeout: any = null;

// Display a visual warning/info toast overlay inside the player using safe DOM APIs
export function showInfoToast(text: string): void {
  const video = getActiveVideo();
  if (!video) return;
  const playerContainer = video.parentElement;
  if (!playerContainer) return;

  let toast = playerContainer.querySelector('#pwc-speed-toast') as HTMLElement | null;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pwc-speed-toast';
    toast.className = 'pwc-speed-toast';
    playerContainer.appendChild(toast);
  }

  toast.textContent = '';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#eaaa2e');
  svg.setAttribute('stroke-width', '2.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute(
    'd',
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'
  );
  svg.appendChild(path);

  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', '12');
  line.setAttribute('y1', '9');
  line.setAttribute('x2', '12');
  line.setAttribute('y2', '13');
  svg.appendChild(line);

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '17');
  circle.setAttribute('r', '0.5');
  circle.setAttribute('fill', 'currentColor');
  svg.appendChild(circle);

  toast.appendChild(svg);

  const span = document.createElement('span');
  span.textContent = text;
  toast.appendChild(span);

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.classList.remove('pwc-toast-visible');
  // Trigger DOM reflow to restart transition
  void toast.offsetHeight;
  toast.classList.add('pwc-toast-visible');

  toastTimeout = setTimeout(() => {
    if (toast) {
      toast.classList.remove('pwc-toast-visible');
    }
  }, 1800);
}
