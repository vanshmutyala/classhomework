# Homework UI Starter

A simple UI application scaffold built with React and Vite, ready to connect to GitHub and deploy on Netlify.

## Stack

- React
- Vite
- Netlify configuration included in `netlify.toml`

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Deploy to Netlify from GitHub

1. Push this project to a GitHub repository.
2. In Netlify, choose **Add new site** -> **Import an existing project**.
3. Connect GitHub and select your repository.
4. Use these build settings:

```txt
Build command: npm run build
Publish directory: dist
```

The included `netlify.toml` file already matches those settings and also adds a redirect for single-page app routing.
