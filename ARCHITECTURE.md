# How it works

- React and Vite serve a small static website on GitHub Pages.
- `src/data/speculative-route-directory.json` is the public list of qualifying studios.
- A studio is added only after its own website or studio-controlled application system explicitly invites speculative/open/general applications.
- The website searches the JSON list and links directly to the official application page.
- Personal application records use the existing encrypted browser-local vault. They are never sent to a server or stored in the public JSON.
- There is no backend or scheduled scanner.

A future checker can revisit saved URLs and flag changes. A failed or blocked page must be marked for review, not assumed closed.
