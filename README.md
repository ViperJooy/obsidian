# Obsidian Media Player

[![Build Status](https://github.com/ViperJooy/obsidian/actions/workflows/build.yml/badge.svg)](https://github.com/ViperJooy/obsidian/actions/workflows/build.yml)

[English](README.md) | [中文](README.zh-CN.md)

An elegant, modern, and highly responsive Emby client built with React 19, TypeScript, and Vite. Designed to provide a cinematic and immersive experience for your personal media library.

---

## Demo

![Demo 1](demo/1.png)

![Demo 2](demo/2.png)

![Demo 3](demo/3.png)

---

## Features

- **Cinematic UI**: Stunning glassmorphism design with immersive backdrops, built using Tailwind CSS v4.
- **Full Playback Support**: Seamlessly stream content with Direct Play and HLS Transcoding via `hls.js`.
- **Smart Progress Sync**: Automatically synchronizes your playback progress with your Emby server so you can resume exactly where you left off.
- **Multi-Language Support**: Fully internationalized (i18n) supporting English and Simplified Chinese.
- **Dynamic Theming**: Flawless Light/Dark mode transitions with customizable accent colors (Royal Purple, Golden Amber, Emerald Green, Rose Pink).
- **Rich Media Info**: Browse movies, TV series, episodes, cast & crew, and discover similar recommendations.
- **Keyboard Shortcuts**: Control playback via intuitive keyboard bindings (Space, Arrows, M, F, Esc).

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Animations | [Motion (Framer Motion)](https://motion.dev/) |
| Routing | [React Router v7](https://reactrouter.com/) |
| i18n | [react-i18next](https://react.i18next.com/) |
| Video Player | Native HTML5 Video + [hls.js](https://github.com/video-dev/hls.js/) |

## Automated Build via GitHub Actions

This project includes an automated GitHub Actions workflow (`.github/workflows/build.yml`) that builds the application. You can configure your Emby server URL via GitHub Repository Variables or Secrets.

**Setup Instructions:**

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **Variables** (or Secrets).
2. Add a new variable:
   - Name: `VITE_EMBY_SERVER_URL`
   - Value: `https://your-emby-server.com`
3. Any push to the `main` branch will automatically trigger a build. Download the compiled artifact from the **Actions** tab.
4. You can also manually trigger a build from the **Actions** tab and specify the server URL on the fly.

## Local Development

```bash
# Clone the repository
git clone git@github.com:ViperJooy/obsidian.git
cd obsidian

# Install dependencies
npm install

# Configure your Emby Server
# Update .env to point to your Emby server instance

# Start the development server
npm run dev
```

## License

MIT
