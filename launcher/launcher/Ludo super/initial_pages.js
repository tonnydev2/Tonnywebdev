// initial_pages.js - Updated
import { showWinScreen } from './main.js';
export function hide(element) {
  if (element) {
    element.style.display = "none";
  }
}

export function show(element) {
  if (element) {
    element.style.display = "block";
  }
}

export function progress() {
  const screen2 = document.getElementById('screen2');
  const screen3 = document.getElementById('screen3');
  const bar = document.querySelector('.progress');
  const percent = document.querySelector('.percent');
  
  if (!bar || !percent) {
    console.error('Progress bar elements not found');
    return;
  }
  
  let progressValue = 0;
  
  const updateProgress = () => {
    if (progressValue <= 99) {
      progressValue += Math.floor(Math.random() * 2);
      bar.style.width = progressValue + '%';
      percent.innerHTML = progressValue + '%';
      setTimeout(updateProgress, 50);
    } else {
      // Progress complete
      bar.style.width = '100%';
      percent.innerHTML = '100%';
      console.log('Progress complete!');
      hide(screen1);
      show(screen2);
      
    }
  };
  
  updateProgress();
}