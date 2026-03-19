# filediff

A browser-based git diff viewer. Run it in any git repo and it opens a clean, visual diff of your changes in the browser.

## Why?

I wanted to view diffs of a local git directory in a better way. The diffing view in the editor felt too cramped and hard to view, especially across multiple files. I didn't want to push to a remote just to get a decent visual, and I didn't want to install a heavy GUI app for something that should be simple.

So I built a small CLI that spins up a proper diff view in the browser. No extensions, no accounts — just one command and a clean view I can share my screen with.

![screenshot](./screenshot.png)

## Features

- Syntax highlighted diffs
- Side-by-side (split) and stacked (unified) diff views
- Filter to a subdirectory within the repo
- Uses execFile instead of exec to prevent shell injection
- Spins up a simple Node HTTP server with no external dependencies

## Installation

```
npm install -g @brinzl/filediff
```

## Usage

```
filediff [options]

Options:
  -d, --dir <path>       Directory to serve (default: .)
  -p, --port <number>    Port number (default: 4321)
  -s, --sub-dir <path>   Filter to a subdirectory within the repo
  -o, --open             Auto-open the browser
  -h, --help             Show this help message
```

## Acknowledgments

Some libraries and tools that made it much simpler to build the UI.

- [@pierre/diffs](https://diffs.com) for the diff rendering component that powers the diff view
- [@base-ui/react](https://base-ui.com) for the UI components that made building the interface a lot easier
