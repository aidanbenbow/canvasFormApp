export const dropdownMenuRenderStrategy = {
    render(node, ctx) {
      const { x, y, width } = node.bounds;
      const optionHeight = node.style?.optionHeight ?? 24;
  
      ctx.save();
  
      // --- 1. Draw menu background & border ---
      ctx.fillStyle = node.style?.backgroundColor ?? "#fff";
      ctx.strokeStyle = node.style?.borderColor ?? "#ccc";
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, width, node.options.length * optionHeight);
      ctx.strokeRect(x, y, width, node.options.length * optionHeight);
  
      // --- 2. Draw each option ---
      ctx.font = node.style?.font ?? "14px sans-serif";
      ctx.textBaseline = "middle";
  
      node.options.forEach((opt, i) => {
        const optionY = y + i * optionHeight;
  
        // Highlight selected option
        if (i === node.selectedIndex) {
          ctx.fillStyle = "rgba(0, 120, 215, 0.8)";
          ctx.fillRect(x, optionY, width, optionHeight);
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = node.style?.textColor ?? "#000";
        }
  
        ctx.fillText(opt, x + (node.style?.paddingX ?? 8), optionY + optionHeight / 2);
      });
  
      ctx.restore();
    },
  };
  