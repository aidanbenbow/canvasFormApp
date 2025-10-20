export class Animator {
    constructor() {
      this.animations = [];
    }
  
    add({ target, property, from, to, duration, easing = t => t, onComplete }) {
      const start = performance.now();
      this.animations.push({ target, property, from, to, duration, easing, start, onComplete });
    }
  
    update(time = performance.now()) {
      this.animations = this.animations.filter(anim => {
        const progress = Math.min((time - anim.start) / anim.duration, 1);
        const value = anim.from + (anim.to - anim.from) * anim.easing(progress);
        anim.target[anim.property] = value;
        if (progress >= 1) {
          anim.onComplete?.();
          return false;
        }
        return true;
      });
    }
  }
  