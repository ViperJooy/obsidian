# Obsidian Media Player 

[![Build Status](https://github.com/ViperJooy/obsidian/actions/workflows/build.yml/badge.svg)](https://github.com/ViperJooy/obsidian/actions/workflows/build.yml)

[English](#english-documentation) | [中文说明](#中文说明)

---

## English Documentation

An elegant, modern, and highly responsive Emby client built with React 19, TypeScript, and Vite. Designed to provide a cinematic and immersive experience for your personal media library.

### ✨ Features

- **Cinematic UI**: Stunning glassmorphism design with immersive backdrops, built using Tailwind CSS v4.
- **Full Playback Support**: Seamlessly stream content with Direct Play and HLS Transcoding via `hls.js`.
- **Smart Progress Sync**: Automatically synchronizes your playback progress with your Emby server so you can resume exactly where you left off.
- **Multi-Language Support**: Fully internationalized (i18n) supporting English and Simplified Chinese (简体中文).
- **Dynamic Theming**: Flawless Light/Dark mode transitions with customizable accent colors (Royal Purple, Golden Amber, Emerald Green, Rose Pink).
- **Rich Media Info**: Browse movies, TV series, episodes, cast & crew, and discover similar recommendations.
- **Keyboard Shortcuts**: Control playback via intuitive keyboard bindings (Space, Arrows, M, F, Esc).

### 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion (Framer Motion)](https://motion.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **i18n**: [react-i18next](https://react.i18next.com/)
- **Video Player**: Native HTML5 Video + [hls.js](https://github.com/video-dev/hls.js/)

### 🛠️ Automated Build via GitHub Actions

This project includes an automated GitHub Actions workflow (`.github/workflows/build.yml`) that builds the application. You can configure your Emby server URL via GitHub Repository Variables or Secrets.

**Setup Instructions:**
1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **Variables** (or Secrets).
2. Add a new variable:
   - Name: `VITE_EMBY_SERVER_URL`
   - Value: `https://your-emby-server.com`
3. Any push to the `main` branch will automatically trigger a build, and you can download the compiled `dist/` folder from the GitHub Actions tab.
4. You can also manually trigger a build from the Actions tab and specify the server URL on the fly.

### 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone git@github.com:ViperJooy/obsidian.git
   cd obsidian
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your Emby Server:**
   Update `.env` or `src/config.ts` to point to your Emby server instance.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 中文说明

一款基于 React 19、TypeScript 和 Vite 构建的现代化 Emby 客户端。旨在为你个人的媒体库提供极具沉浸感和电影级的观看体验。

### ✨ 核心特性

- **电影级 UI**：基于 Tailwind CSS v4 打造的极致毛玻璃（Glassmorphism）视觉效果。
- **全方位播放支持**：内置原生 HTML5 播放与基于 `hls.js` 的完美 HLS 转码流播放。
- **智能进度同步**：与 Emby 服务器实时双向同步播放进度，随时随地“继续观看”。
- **完善的国际化**：全面支持中英双语无缝切换，连细节组件也覆盖到位。
- **动态主题系统**：无缝的浅色/深色模式，并支持自定义强调色（皇家紫、琥珀金、祖母绿、玫瑰粉）。
- **沉浸式媒体信息**：浏览电影、电视剧、单集列表、演职人员及相似推荐，海报背景智能融合。
- **快捷键控制**：提供符合直觉的键盘快捷键（空格播放/暂停、方向键快进快退调音量、M 静音、F 全屏等）。

### 🚀 技术栈

- **框架**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **动画**: [Motion (Framer Motion)](https://motion.dev/)
- **路由**: [React Router v7](https://reactrouter.com/)
- **多语言**: [react-i18next](https://react.i18next.com/)
- **播放器核心**: 原生 HTML5 Video + [hls.js](https://github.com/video-dev/hls.js/)

### 🛠️ GitHub Actions 自动化打包

本项目已经内置了 GitHub Actions 自动化构建工具 (`.github/workflows/build.yml`)。你可以直接在 GitHub 的项目设置中配置你的 Emby 服务器地址，它会自动帮你打包好随时可用的产物。

**配置指南：**
1. 进入你的 GitHub 仓库 -> 点击顶部 **Settings** -> 左侧选择 **Secrets and variables** -> **Actions** -> 切换到 **Variables** (或者 Secrets) 标签页。
2. 点击 **New repository variable** 添加新变量：
   - Name: `VITE_EMBY_SERVER_URL`
   - Value: `你的 Emby 服务器地址 (例如 https://emby.xxx.com)`
3. 此后，每次有代码推送到 `main` 分支，系统都会自动拉起构建，并将打包好的 `dist/` 文件夹作为 Artifact 提供下载。
4. 你也可以在 GitHub 的 **Actions** 页面手动触发构建，并在弹出的输入框里临时指定 Emby 服务器的 URL。

### 💻 本地开发

1. **克隆项目:**
   ```bash
   git clone git@github.com:ViperJooy/obsidian.git
   cd obsidian
   ```

2. **安装依赖:**
   ```bash
   npm install
   ```

3. **配置 Emby 服务:**
   复制 `.env.example` 并重命名为 `.env`，填写你的 Emby 服务器地址。

4. **启动开发环境:**
   ```bash
   npm run dev
   ```
