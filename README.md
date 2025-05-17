# Windows 11 Web Simulator

A web-based Windows 11 desktop environment simulator built with React and TypeScript. This project recreates the Windows 11 user interface with a functional taskbar, start menu, window management system, and several built-in applications.

![Windows 11 Web Simulator](./public/screenshots/desktop.png)

## Features

- **Windows 11 UI**: Authentic Windows 11 design language and interactions
- **Window Management**: Draggable, resizable windows with minimize/maximize/close controls
- **Taskbar**: Windows 11-style taskbar with start menu, pinned apps, and system tray
- **Start Menu**: App launcher with search, pinned, and recent applications
- **Dark/Light Themes**: Full support for both themes with automatic system preference detection
- **Built-in Applications**:
  - Calculator
  - Notepad
  - File Explorer
  - Terminal/Command Line
  - Settings
  - Weather
  - Calendar

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
