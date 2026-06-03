import { ApexXAxis } from 'ng-apexcharts';

/**
 * Returns a memoizer that yields a **stable** ApexXAxis reference for as long as the
 * categories are unchanged.
 *
 * ng-apexcharts fully destroys + asynchronously re-renders a chart whenever ANY input
 * other than `series` changes reference (see chart.component `ngOnChanges`). Our chart
 * categories (employee / team / project names) are period-independent — only the values
 * change when the period changes — so handing the chart a brand-new `xaxis` object each
 * emission forces a needless recreate (flicker + the layout collapse that jumped the
 * page scroll). Reusing the same object reference while the categories match means a
 * period change alters only `series`, so ng-apexcharts updates in place.
 *
 * Categories genuinely changing (e.g. an employee added/removed) produces a new
 * reference and a one-off recreate, which is correct.
 */
export function stableXaxis(): (categories: string[]) => ApexXAxis {
  let key = '';
  let ref: ApexXAxis = { categories: [] };
  return (categories: string[]) => {
    const next = JSON.stringify(categories);
    if (next !== key) {
      key = next;
      ref = { categories };
    }
    return ref;
  };
}
