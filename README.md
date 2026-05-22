# Tanishq — Portfolio

Personal portfolio site for Tanishq, Industrial Engineering student (B.Eng.)
at THD — European Campus Rottal-Inn.

A single, self-contained `index.html` — all CSS and JavaScript are inline,
so there is no build step and no dependencies to install. The only external
request is the Google Fonts stylesheet.

## Features

- Animated hero with a live aurora canvas, floating particles and a rotating tagline
- Scroll-triggered reveals, parallax and a scrollytelling "How it lands" section
- Micro-interactions: custom cursor, magnetic buttons, card tilt, sheen sweeps,
  like buttons, ripple feedback
- A fully playable **Snake game** — inline in the project card and in a
  fullscreen modal (keyboard, WASD, swipe and on-screen D-pad controls)
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

1. Create a new repository and upload these files.
2. In the repository: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick the `main` branch and the `/ (root)` folder, then **Save**.
4. The site goes live at `https://<your-username>.github.io/<repo-name>/`.

The included empty `.nojekyll` file tells GitHub Pages to serve the files
as-is without Jekyll processing.

## Contact

- Email: tanishq114@gmail.com
- Location: München, DE
