# People Directory UI

React/Vite frontend for the `myfirstproject` employee API.

## Run

1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` if the backend uses a different URL.
4. Run `npm run dev`.

During local development, Vite proxies `/api` to `http://localhost:8080`, avoiding browser CORS issues. The UI uses `/api/employees` for list, create, update, and delete operations.

## Project files

- `index.html` is the browser's starting page. It contains the `<div id="root"></div>` element where React displays the app, and loads `src/main.jsx`.
- `src/main.jsx` starts React. It finds the root element, imports the `App` component and the stylesheet, and renders the app.
- `src/App.jsx` contains the employee directory UI and its behavior: loading, searching, filtering, adding, editing, and deleting people.
- `src/index.css` contains the page styles, including layout, colors, typography, responsive rules, and animations.
- `vite.config.js` configures Vite and forwards development requests beginning with `/api` to the backend at `http://localhost:8080`.
- `.env.example` shows the optional `VITE_API_URL` setting. The app uses this value when provided, or `/api` by default.
- `package.json` lists the project dependencies and the commands used to run and build the app.
- `README.md` contains setup instructions and this project guide.

## How the app starts

The browser loads `index.html`, which loads `src/main.jsx`. That file renders the `App` component into the root element. `App.jsx` builds the page, while `index.css` styles it. When the page needs employee data, `App.jsx` sends requests to the backend API.

## React concepts used here

- **Component:** `App` is a React component. It returns JSX, a syntax that looks like HTML but can include JavaScript values and event handlers.
- **State:** `useState` stores values that can change, such as the employee list, search text, selected team, form fields, and loading or error status. Updating state tells React to update the screen.
- **Effect:** `useEffect` calls `loadEmployees` when the app starts so the directory can be filled from the backend.
- **Derived values:** `useMemo` calculates the team options and the filtered employee list from existing state. These values are recalculated when their listed dependencies change.
- **Event handlers:** Functions such as `openCreate`, `updateForm`, and `saveEmployee` respond to clicks and form changes. JSX connects them to elements with properties such as `onClick`, `onChange`, and `onSubmit`.
- **Rendering lists:** `.map()` creates a table row for each employee. The `key` property gives each row a stable identifier, here the employee's `id`.
- **Conditional rendering:** Conditions show the right UI for the current state, such as an error message, loading row, employee rows, or an empty-search message.
- **Controlled form:** Each input gets its current value from React state. Its `onChange` handler updates that state, so the form data stays in sync with what is typed.

## Employee data flow

`loadEmployees` sends a `GET` request to `/api/employees` and stores the returned JSON in state. `saveEmployee` sends a `POST` request to create an employee or a `PUT` request to update one. `deleteEmployee` sends a `DELETE` request. After a successful create, update, or delete, the app reloads the list from the backend.

The search and team filter work on the employee list already in state; they do not send a new API request for every keystroke. The form converts `salary` to a number before sending the employee data as JSON.

## Useful commands

- `npm run dev` starts the local development server.
- `npm run build` creates an optimized production build in `dist/`.
- `npm run preview` serves the production build locally for a quick check.