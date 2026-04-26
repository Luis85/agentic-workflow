# UX & UI Steering

> **Replace this whole file** with your design system's reality.

## Design principles

Three to five short principles that guide design decisions. Each principle has a *do* and a *don't*.

- **Principle 1** — *Do …, don't …*
- **Principle 2** — *Do …, don't …*

## Design system

- System name and version: …
- Component library: …
- Tokens (colour, type, spacing): location …
- Iconography: …
- Illustration style: …
- Reference: link to Figma library / Storybook.

## Information architecture

High-level map of the product: top-level sections, primary navigation patterns, deep-link conventions.

## Interaction patterns

- Loading states: shimmer / spinner / skeleton — when each.
- Empty states: prescribed structure (illustration + headline + 1-line copy + primary action).
- Error states: standard pattern; never blame the user.
- Confirmation: when modal vs. inline vs. toast.
- Form validation: when inline, when on submit.

## Accessibility

- Conformance target: WCAG 2.2 AA (or higher).
- Colour contrast minimums.
- Keyboard navigation: every interactive element reachable, focus visible.
- Screen-reader labels mandatory on icon-only buttons.
- Motion: respect `prefers-reduced-motion`.
- Test with: axe / Lighthouse / manual SR pass on critical flows.

## Content & voice

- Tone words (3 of them).
- Reading level target.
- Sentence-case vs. title-case for UI labels.
- Forbidden words / phrases.
- Date, time, currency formatting per locale.

## Localisation

- Supported locales: …
- Pluralisation library: …
- RTL support: yes / no / partial.
- String externalisation rule: every user-visible string lives in i18n files; no hard-coded copy in components.

## Things agents commonly get wrong here

- (List as you discover them.)
