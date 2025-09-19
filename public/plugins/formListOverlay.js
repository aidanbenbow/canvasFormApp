export class FormListOverlay {
    constructor({ ctx, forms, onEdit, onViewResults }) {
      this.ctx = ctx;
      this.forms = forms;
      this.onEdit = onEdit;
      this.onViewResults = onViewResults;
      this.buttonBounds = []; // stores clickable regions
    }
  
    render() {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx.font = '16px sans-serif';
      this.buttonBounds = [];
  
      this.forms.forEach((form, i) => {
        const y = 50 + i * 60;
  
        // Background row
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(20, y, 400, 40);
  
        // Form label
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${form.label} (${form.id})`, 30, y + 25);
  
        // Edit button
        const editBtn = { x: 200, y, width: 50, height: 30 };
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(editBtn.x, editBtn.y + 5, editBtn.width, editBtn.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Edit', editBtn.x + 10, editBtn.y + 25);
  
        // View button
        const viewBtn = { x: 260, y, width: 50, height: 30 };
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(viewBtn.x, viewBtn.y + 5, viewBtn.width, viewBtn.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('View', viewBtn.x + 10, viewBtn.y + 25);
  
        this.buttonBounds.push({
          form,
          edit: editBtn,
          view: viewBtn
        });
      });
    }
  
    handleClick(x, y) {
      for (const { form, edit, view } of this.buttonBounds) {
        const inEdit = x >= edit.x && x <= edit.x + edit.width &&
                       y >= edit.y + 5 && y <= edit.y + 5 + edit.height;
        const inView = x >= view.x && x <= view.x + view.width &&
                       y >= view.y + 5 && y <= view.y + 5 + view.height;
  
        if (inEdit) return this.onEdit(form);
        if (inView) return this.onViewResults(form);
      }
    }
  }