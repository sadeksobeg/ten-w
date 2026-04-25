console.log(`
QA checklist (run locally after npm install):

1) Lighthouse (Chrome DevTools): Performance, Accessibility, SEO — target ≥90 where feasible.
2) axe DevTools or @axe-core/cli on key routes (/ar, /en, /ar/contact).
3) Keyboard: Tab order, focus rings, skip link on /ar and /en.
4) RTL: verify /ar layouts and mixed Arabic/English labels.
5) Growth dashboard: with prefers-reduced-motion, confetti and heavy motion should stay off; tab to modals and forms.

CI: add Playwright + axe-core or pa11y when ready.
`);
