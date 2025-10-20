import { utilsRegister } from "../utils/register.js";

export class DashboardOverlay {
    constructor({ ctx, forms, onCreateForm, onEditForm, onViewResults, layoutManager }) {
      this.ctx = ctx;
      this.forms = forms;
      this.layoutManager = layoutManager;
      this.onCreateForm = onCreateForm;
      this.onEditForm = onEditForm;
      this.onViewResults = onViewResults;
      this.type = 'dashboardOverlay';
    }
  
    render({ ctx }) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
      const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
      ctx.font = getLogicalFontSize(24, ctx.canvas.height);
      ctx.fillStyle = '#333';
      ctx.fillText('Welcome, Admin!', 50, 50);
  
      // Create Form Button
      const buttonBounds = { x: 50, y: 100, width: 200, height: 40 };
      ctx.fillStyle = '#007bff';
      ctx.fillRect(buttonBounds.x, buttonBounds.y, buttonBounds.width, buttonBounds.height);
      ctx.fillStyle = '#fff';
      ctx.fillText('Create New Form', buttonBounds.x + 10, buttonBounds.y + 25);
      this.createButtonBounds = buttonBounds;
  
      // Render form list
      let y = 160;
      this.formBounds = [];
      this.forms.forEach((form, index) => {
        const boxY = y + index * 60;
        const box = { x: 50, y: boxY, width: 400, height: 50 };
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.fillStyle = '#000';
        ctx.fillText(form.title || `Form ${index + 1}`, box.x + 10, box.y + 30);
  
        // Action buttons
        ctx.fillStyle = '#28a745';
        ctx.fillRect(box.x + 310, box.y + 10, 40, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText('✎', box.x + 320, box.y + 30);
  
        ctx.fillStyle = '#17a2b8';
        ctx.fillRect(box.x + 360, box.y + 10, 40, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText('📊', box.x + 370, box.y + 30);
  
        this.formBounds.push({ form, edit: { x: box.x + 310, y: box.y + 10, width: 40, height: 30 }, view: { x: box.x + 360, y: box.y + 10, width: 40, height: 30 } });
      });
    }
  
    handleClick(x, y) {
      // Create Form
      const b = this.createButtonBounds;
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        this.onCreateForm();
        return;
      }
  
      // Form actions
      for (const { form, edit, view } of this.formBounds) {
        if (x >= edit.x && x <= edit.x + edit.width && y >= edit.y && y <= edit.y + edit.height) {
          this.onEditForm(form);
          return;
        }
        if (x >= view.x && x <= view.x + view.width && y >= view.y && y <= view.y + view.height) {
          this.onViewResults(form);
          return;
        }
      }
    }
  }
  