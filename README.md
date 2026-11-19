# Applyboard

A small, accessible board for tracking internship applications. Built with plain HTML, CSS and JavaScript, with no frameworks or build step.

**Live demo:** https://sijanmahat.github.io/applyboard/
![Applyboard board showing applications in five status columns](docs/screenshot.png)

## Features
- Add, edit and delete applications, with an undo after delete
- Five status columns: Wishlist, Applied, Interview, Offer, Rejected
- Live search and status filter
- Summary stats: tracked, applied and reply rate
- Data saved in the browser with `localStorage`
- Copy all data as JSON
- Light and dark theme (follows the system, with a manual toggle)
- Responsive layout (5, 2 or 1 columns)

## Accessibility
- Native `<dialog>` for the form, with labelled inputs
- Visible keyboard focus on every control
- Cards move between columns with a dropdown, so no mouse or drag is needed
- Status messages use an `aria-live` region
- Animations respect `prefers-reduced-motion`

## Tech
HTML5, CSS custom properties and Grid, vanilla JavaScript (ES2020), Web Storage API.

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Project structure
```
index.html      page structure
css/style.css   theme tokens and layout
js/app.js       state, rendering and events
docs/           guides and notes
```

## What I learned
- Keeping a single source of truth (`items`) and re-rendering from it
- Event delegation for dynamic lists
- Escaping user input before putting it in HTML
- Building responsive and accessible UI without a library

## Ideas for next steps
- Drag and drop between columns
- Deadline reminders
- CSV import and export
- Rewrite in React with TypeScript

## License
MIT
