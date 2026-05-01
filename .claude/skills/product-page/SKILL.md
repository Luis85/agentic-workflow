---
name: product-page
description: Create + maintain public product page (sites/index.html) via GitHub Pages. Use on launch, positioning change, user-visible release.
argument-hint: [product or project name]
---

# Product page

Every project or product should have a living public product page. The page explains what the product is, who it serves, what it does, and how to start. It is maintained with the product, not as a one-off launch artifact.

## Canonical output

```
sites/index.html
sites/styles.css                # optional, preferred for non-trivial pages
sites/assets/*                  # optional visuals and media
.github/workflows/pages.yml     # preferred when hosted on GitHub Pages
```

`sites/index.html` must be directly openable without a build step. If the project already has a documented static-site framework, the framework may generate the hosted page, but `sites/index.html` still exists as the accessible static entrypoint or redirect.

## When to invoke

- Starting a new product, project, template, or public repository.
- A discovery sprint produces a chosen product direction.
- Product positioning, audience, pricing, onboarding, or getting-started flow changes.
- A release changes user-visible capabilities enough that the public page would be stale.
- The user asks for a product page, landing page, homepage, website, GitHub Pages site, or public launch page.

## Procedure

1. **Ground the page in product truth.** Read README, `docs/steering/product.md`, `docs/steering/ux.md`, and any active brief/release notes. If they disagree, ask the user or leave a short clarification list before writing claims.
2. **Choose hosting.** Prefer GitHub Pages via Actions for GitHub repos. If another host is required, keep `sites/index.html` useful and document the alternate hosting path.
3. **Create or update the page.** Include product name, value proposition, problem, target users, core features, proof or workflow visual, getting-started path, and repo/docs/license links.
4. **Keep it maintainable.** Use plain HTML/CSS by default. Add dependencies only when the project already has a site stack or the page needs a documented capability that static files cannot provide.
5. **Verify.** Run the project verify gate. Also check that local asset paths resolve, links are current, the page is responsive, and the hosting workflow deploys the correct folder.
6. **Report upkeep.** In the PR summary, state whether the product page was created, updated, or intentionally unchanged and why. If unchanged, name the reason in the PR checkbox line.

## Upkeep checklist

- Product name and value proposition checked against README/steering.
- Primary CTA checked.
- User-facing claims checked against repo artifacts.
- Local CSS and asset references checked.
- Hosting workflow checked.
- PR summary says `product page updated` or `product page unaffected: <reason>`.

## GitHub Pages defaults

- Deploy `sites/` through `.github/workflows/pages.yml`.
- Trigger on push to the integration branch and `workflow_dispatch`.
- Use `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
- Do not directly publish or change repository Pages settings without explicit human authorization.

## Design and content bar

- The first viewport must make the product name and value proposition obvious.
- Use one primary CTA and one supporting CTA when possible.
- Prefer visuals that explain the product, workflow, or artifact over decorative backgrounds.
- Keep copy specific and grounded in repository artifacts.
- Meet WCAG AA contrast, visible focus, keyboard navigation, and responsive layout expectations.

## Do not

- Do not bury the product page under docs-only navigation.
- Do not invent customer claims, metrics, integrations, or roadmap commitments.
- Do not let the page drift when user-visible product behavior changes.
- Do not add a heavy frontend framework for a static product pitch by default.
