export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getTimeColor = (timeLeft, totalTime) => {
  const percentage = (timeLeft / totalTime) * 100;
  
  if (percentage > 50) return '#28a745'; // Green
  if (percentage > 20) return '#ffc107'; // Yellow
  return '#dc3545'; // Red
};

export class ExamTimer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration; // in seconds
    this.timeLeft = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      
      if (this.onTick) {
        this.onTick(this.timeLeft);
      }
      
      if (this.timeLeft <= 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  pause() {
    this.stop();
  }

  resume() {
    if (this.timeLeft > 0) {
      this.start();
    }
  }

  reset() {
    this.stop();
    this.timeLeft = this.duration;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  getPercentageLeft() {
    return (this.timeLeft / this.duration) * 100;
  }
}