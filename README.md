# Sidhant Maloo — Personal Site

A static site with a printed-circuit-board design language: soldermask
greens, copper-trace accents, and a live animated circuit board running
behind every page (see `js/circuit-bg.js`).

## Structure

```
/
├── index.html              Home
├── about.html               About
├── resume.html               Resume
├── contact.html               Contact
├── projects/
│   ├── index.html            Projects overview
│   ├── robotics.html          Robotics
│   ├── simulations.html       Simulations
│   ├── research.html          Research
│   └── notebook.html          Notebook (project log)
├── css/
│   ├── style.css             Design system: colors, type, nav, layout
│   └── pages.css              Page-specific styles
├── js/
│   ├── circuit-bg.js          The animated circuit background
│   └── main.js                 Mobile nav + active-link highlighting
└── assets/                    Put images / your resume PDF here
```

## Things to edit before you publish

Search each page for `<!-- EDIT ME -->` comments — they mark placeholder
content written to show the layout, not real information:

- **index.html** — hero stats, "Currently" panel
- **about.html** — timeline milestones, skill bar widths, "beyond the bench"
- **projects/robotics.html** & **simulations.html** — project cards
  (swap the "IMAGE / DEMO GIF" thumbnail text for a real `<img>`, e.g.
  `<img src="../assets/rover.jpg" alt="...">` inside `.thumb`)
- **projects/research.html** — write-up list, link titles to PDFs or pages
- **projects/notebook.html** — log entries (add a new `.log-entry` block
  at the top each time you update)
- **resume.html** — `assets/sidhant-maloo-resume.pdf` is already wired up
  to the "Download PDF" button; replace that file whenever you export a
  new version, and keep the on-page sections in sync with it. Each
  section (Experience, Leadership & Community, Projects, Awards) has a
  `TEMPLATE` comment marking the block to copy for a new entry.
- **contact.html** — the GitHub/LinkedIn links are still placeholders;
  swap in your real profile URLs. The form submits via `mailto:` to your
  email, which opens the visitor's own email client — fine for a
  low-traffic personal site, but if you want submissions to land
  somewhere directly, point the form's `action` at a service like
  Formspree instead. Your phone number from the resume PDF was
  deliberately left off the live site — easy to add to the contact list
  if you want it public, but a phone number on a public page is worth
  thinking about before you do.

## Running it locally

No build step — it's plain HTML/CSS/JS. Just open `index.html` in a
browser, or serve the folder locally:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Hosting it for free

This is a static site, so **GitHub Pages** is the easiest option:

1. Push this folder to a GitHub repo (e.g. `yourhandle.github.io` for a
   root domain, or any repo name + enable Pages in Settings).
2. In the repo Settings → Pages, set the source to the `main` branch, root.
3. Your site will be live at `https://yourhandle.github.io/` (or the repo's
   Pages URL) within a few minutes.

## Notes on the background

`js/circuit-bg.js` procedurally generates a grid of Manhattan-routed
copper traces on load and on resize, then animates small light "pulses"
traveling along random traces — like current propagating through a live
board. It respects `prefers-reduced-motion` (renders a static board with
no animation for visitors who have that setting on) and is pure canvas
with no external dependencies, so it stays fast even on modest laptops.
