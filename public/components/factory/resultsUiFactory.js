import { BaseUIFactory } from "./baseUiFactory.js";

export class ResultsUIFactory extends BaseUIFactory {
    createResults(results) {
      if (!results.length) {
        return [
          this.create({
            id: 'no-results',
            type: 'text',
            label: 'No results available'
          })
        ];
      }
  
      return results.map((result, i) =>
        this.create({
          id: `result-${i}`,
          type: 'text',
          label: this.format(result)
        })
      );
    }
  
    format(result) {
      return Object.entries(result.inputs)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
  }