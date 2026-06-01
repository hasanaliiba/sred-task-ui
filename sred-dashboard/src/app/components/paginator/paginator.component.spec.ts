import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let c: PaginatorComponent;

  beforeEach(() => {
    c = new PaginatorComponent();
    c.total = 50;
    c.pageSize = 10;
    c.page = 2;
  });

  it('computes page count and the showing range', () => {
    expect(c.pages).toBe(5);
    expect(c.start).toBe(11);
    expect(c.end).toBe(20);
  });

  it('emits pageChange only for valid, different pages', () => {
    const emitted: number[] = [];
    c.pageChange.subscribe((p) => emitted.push(p));
    c.go(3); // valid
    c.go(0); // out of range
    c.go(99); // out of range
    c.go(2); // current page
    expect(emitted).toEqual([3]);
  });

  it('windows page numbers with ellipsis for many pages', () => {
    c.total = 100; // 10 pages
    c.page = 5;
    const v = c.visiblePages;
    expect(v[0]).toBe(1);
    expect(v[v.length - 1]).toBe(10);
    expect(v).toContain(5);
    expect(v).toContain('…');
  });

  it('shows every page when there are few', () => {
    c.total = 30; // 3 pages
    expect(c.visiblePages).toEqual([1, 2, 3]);
  });
});
