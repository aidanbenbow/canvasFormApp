export class KeyboardLayoutStrategy {
  measure(node, constraints, ctx) {
    const maxWidth = constraints.maxWidth;
    const maxHeight = constraints.maxHeight;
    const spacing = isSmallScreen() ? 6 : 8;
    const rowCount = node.keyLayout.length;
    const maxCols = Math.max(...node.keyLayout.map((row) => row.length));

    const targetHeight = isSmallScreen()
      ? Math.max(240, Math.floor(maxHeight * 0.4))
      : Math.min(260, maxHeight);

    const keyHeight = Math.max(44, Math.floor((targetHeight - (rowCount - 1) * spacing) / rowCount));

    let childIndex = 0;
    node.keyLayout.forEach((row) => {
      const rowUnits = row.reduce((sum, key) => sum + node.getKeyWeight(key), 0);
      const unitWidth = (maxWidth - (row.length - 1) * spacing) / rowUnits;

      row.forEach((key) => {
        const child = node.children[childIndex++];
        const keyWidth = unitWidth * node.getKeyWeight(key);
        child.measure({ maxWidth: keyWidth, maxHeight: keyHeight }, ctx);
      });
    });

    const height = rowCount * keyHeight + (rowCount - 1) * spacing;

    return { width: maxWidth, height };
  }

  layout(node, bounds, ctx) {
    node.bounds = bounds;

    const spacing = isSmallScreen() ? 6 : 8;
    const keyHeight = Math.max(44, Math.floor((bounds.height - (node.keyLayout.length - 1) * spacing) / node.keyLayout.length));

    let y = bounds.y + spacing;
    let childIndex = 0;

    node.keyLayout.forEach(row => {
      const rowUnits = row.reduce((sum, key) => sum + node.getKeyWeight(key), 0);
      const unitWidth = (bounds.width - (row.length - 1) * spacing) / rowUnits;
      const rowWidth = row.reduce((sum, key) => sum + unitWidth * node.getKeyWeight(key), 0) + (row.length - 1) * spacing;
      let x = bounds.x + Math.max(0, (bounds.width - rowWidth) / 2);

      row.forEach((key) => {
        const child = node.children[childIndex++];
        const keyWidth = unitWidth * node.getKeyWeight(key);
        child.layout({ x, y, width: keyWidth, height: keyHeight }, ctx);
        x += keyWidth + spacing;
      });

      y += keyHeight + spacing;
    });
  }
  
}

function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}