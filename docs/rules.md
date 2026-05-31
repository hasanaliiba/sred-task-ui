# Engineering Practices

The guiding principles for this project (the Zen of Python, applied to our Angular + Tailwind
dashboard). When a design or code decision is unclear, defer to these.

## Zen

1. Beautiful is better than ugly.
2. Explicit is better than implicit.
3. Simple is better than complex.
4. Complex is better than complicated.
5. Flat is better than nested.
6. Sparse is better than dense.
7. Readability counts.
8. Special cases aren't special enough to break the rules.
9. Although practicality beats purity.
10. Errors should never pass silently.
11. Unless explicitly silenced.
12. In the face of ambiguity, refuse the temptation to guess.
13. There should be one-- and preferably only one --obvious way to do it.
14. Although that way may not be obvious at first unless you're Dutch.
15. Now is better than never.
16. Although never is often better than *right* now.
17. If the implementation is hard to explain, it's a bad idea.
18. If the implementation is easy to explain, it may be a good idea.
19. Namespaces are one honking great idea -- let's do more of those!

## Functional Programming Paradigm

Write the dashboard in a functional style. Prefer composing small, predictable functions over
mutating shared state.

- **Pure functions by default.** A function's output depends only on its inputs; no side effects.
  All derived values (hourly rate, project totals, projections, credit) are pure transformations
  of the data — given the same input, always the same output.
- **Immutability.** Never mutate objects or arrays in place. Produce new values with `map`,
  `filter`, `reduce`, spread (`{...x}`, `[...xs]`). Treat all data as read-only.
- **Reactive, declarative state.** Model state as RxJS streams; derive views with operators
  (`map`, `combineLatest`, `scan`) rather than imperative loops mutating fields. (No Angular
  signals — see the plan.)
- **No shared mutable state.** Updates flow through the store by emitting a new value, not by
  editing the previous one.
- **Composition over inheritance.** Build behavior by composing functions and small utilities;
  avoid deep class hierarchies.
- **Isolate side effects at the edges.** HTTP, DOM, storage, and logging live at the boundaries;
  the core stays pure and testable.
- **Express intent, not mechanics.** Favor declarative pipelines over manual index/accumulator
  bookkeeping. Readability counts (see Zen #7).

## Agent Conduct — No Hallucination, Ask When Unclear

These rules bind any AI agent (including Claude) working on this project.

- **Never invent facts, APIs, files, fields, or behavior.** If a function, type, file path,
  library export, or config option is not confirmed to exist, do not assume it. Verify by reading
  the code/docs first.
- **Ground every claim in evidence.** Cite the file and line, the command output, or the
  requirement you relied on. If you cannot point to a source, say so explicitly rather than
  presenting a guess as fact.
- **Distinguish fact from assumption.** Clearly label anything inferred (e.g. "assuming X because
  Y") so the user can correct it.
- **In the face of ambiguity, stop and ask.** Do not guess at unclear requirements (Zen #12).
  When the request, data shape, or expected behavior is unclear, prompt the user with a specific
  question and concrete options before writing code.
- **Surface what's unclear back to the user.** Before implementing, list any open questions,
  missing inputs, or contradictory requirements. Get them resolved rather than papering over them.
- **Errors should never pass silently** (Zen #10). Report failures, skipped steps, and failing
  tests honestly with the actual output — never claim success without verifying it.
- **Verify before asserting completion.** Run the code/tests and confirm the result before saying
  something works.
