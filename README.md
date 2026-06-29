# Tanishq — Portfolio

Personal portfolio site for Tanishq, Industrial Engineering student (B.Eng.)
at THD — European Campus Rottal-Inn.

A single, self-contained `index.html` — all CSS and JavaScript are inline,
so there is no build step and no dependencies to install. The only external
request is the Google Fonts stylesheet.

## What's in the box

| File / folder | Purpose |
|--------------|---------|
| `index.html` | The whole portfolio site |
| `projects/` | Project screenshots (PNG, full-resolution) |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll processing |
| `README.md` | This file |

## Features

- Animated hero with a live aurora canvas, floating particles and a rotating tagline
- Scroll-triggered reveals, parallax and a scrollytelling "How it lands" section
- Project galleries with hover-to-zoom screenshots (click to open full size)
- A fully playable **Snake game** — inline in the project card and in a
  fullscreen modal (keyboard, WASD, swipe and on-screen D-pad controls)
- Micro-interactions: custom cursor, magnetic buttons, card tilt, sheen sweeps,
  like buttons, ripple feedback
- EN / DE language toggle
- Mobile navigation menu
- Respects `prefers-reduced-motion`

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a new repository and upload everything in this folder.
2. In the repository: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick the `main` branch and the `/ (root)` folder, then **Save**.
4. The site goes live at `https://<your-username>.github.io/<repo-name>/`.

## Contact

- Email: tanishq114@gmail.com
- Location: München, DE
