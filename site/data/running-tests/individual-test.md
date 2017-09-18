## Executing individual feature files or scenarios

Single feature file

```bash
npm run e2e-test -- features/google-search.feature
```

or

```bash
npm run e2e-test -- features/google-search
```

Multiple feature files

```bash
npm run e2e-test -- features/google-search features/duckduckgo-search
```

Single feature file and one folder

```bash
npm run e2e-test -- features/google/google-search features/duckduckgo
```

Single scenario by its line number

```bash
npm run e2e-test -- features/google-search.feature:11
```
