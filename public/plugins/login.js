export class LoginPlugin {
    constructor({ ctx, onLogin }) {
      this.ctx = ctx;
      this.onLogin = onLogin;
      this.bounds = { x: 10, y: 10, width: 100, height: 40 };
    }
  render({ ctx }) {
        this.draw(ctx);
        }

    draw(ctx) {
      ctx.fillStyle = 'gray';
      ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
      ctx.fillStyle = 'white';
      ctx.fillText('Admin Login', this.bounds.x + 10, this.bounds.y + 25);
    }
  
    handleClick(x, y) {
      const within =
        x >= this.bounds.x &&
        x <= this.bounds.x + this.bounds.width &&
        y >= this.bounds.y &&
        y <= this.bounds.y + this.bounds.height;
  
      if (within) {
        const password = prompt('Enter admin password:');
        if (password === 'aa') {
          this.onLogin();
        } else {
          alert('Incorrect password');
        }
      }
    }
  }