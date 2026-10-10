# Vamsi Krishna Yadav — The Engineer’s Journey

A local, standalone HTML/CSS/JavaScript portfolio. No framework, package installation, API key, or production deployment is required.

## Run locally

From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765). Stop the server with **Ctrl+C**.

You can also open `index.html` directly. A local HTTP server is recommended for consistent video behavior. The cinematic intro runs once per browser tab session, and is skipped when arriving at an anchor or when reduced motion is preferred. Open a fresh browser tab to see the opening again.

## Edit content

`content.json` is the single content source for profile links, career roles, internships, projects, education, certifications, skill categories and logo rows. After changing it, run:

```sh
python3 build.py
```

This generates `index.html` and `js/config.js`. The site is already built; Python is only needed when rebuilding content or serving locally.

- `template.html`: page structure, editorial copy, section order.
- `css/base.css`: preserved styling and motion vocabulary from the original portfolio.
- `css/portfolio.css`: cinematic identity, responsive layouts and motion refinements.
- `js/boot.js`: first-visit intro eligibility and independent 6.5-second fail-safe.
- `js/app.js`: video/portrait transition, role switcher, accessible tabs, scroll progression, mobile navigation and motion controls.
- `public/images/`: both supplied photographs, the car poster and original VK favicon.
- `public/icons/`: locally hosted SVG technology logos.
- `public/fonts/`: locally hosted Bricolage Grotesque font and license.
- `public/videos/hero-cars.mp4`: silent, 1280 × 720 H.264 intro, 5.21 seconds, approximately 1.3 MB.

## Next edits

1. **Resume:** add your PDF and set `CFG.resumeUrl` in `content.json`, then rebuild. Until then, “Request Resume” opens a real email request.
2. **Project links:** populate a project’s `gh` or `demo` only when a public repository or demo actually exists. Missing links render no dead buttons.
3. **Learning status:** Vite, Tailwind CSS, Node.js basics, Java 17/21 concepts, and concurrency/multithreading are explicitly listed as currently learning, as confirmed in this task. Move them into established categories when supported by project experience.
4. **Future footage:** replace the MP4/poster at the existing paths, keeping the clip short, muted and optimized. Record the new source and license in `CREDITS.md`.
5. **Graduation/certificates:** confirm the degree award status and add genuine certificate verification links when available. The current site states the 2022–2026 academic period without asserting a degree award.

## Reliability and accessibility

- Main content is static HTML and remains available without JavaScript.
- Intro controls and navigation remain accessible; scrolling or selecting a page section exits the intro.
- Desktop uses the local muted MP4. Mobile, Save-Data, and slow connections use a brief poster treatment with no video request.
- A poster and original SVG road illustration provide media fallbacks.
- Reduced-motion preferences bypass the intro, freeze continuous motion, and show final timeline/results states.
- Skill tabs support Left/Right, Home/End, and ordinary Tab navigation. Project details use native `<details>`/`<summary>`.
- Logo motion pauses on hover/focus. “Pause motion” also stops the role cycle and decorative animations.
- External links consistently use `noopener noreferrer`.
- No analytics, scraping, contact-form backend, fabricated model metrics, fake telemetry service, or external runtime assets.

See `../IMPLEMENTATION-REPORT.md` for the actual validation scope and limitations, and `CREDITS.md` for asset sources. No site was published during this task.
