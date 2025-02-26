git clone https://github.com/yourusername/todo-list-app.git
   cd todo-list-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Development Commands

The following commands are available for development:

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm test` | Run test suite |
| `npm run build` | Build production-ready application |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Run Prettier to format code |

## Project Structure

The project follows a feature-based organization structure:

```
todo-app/
├── public/                 # Static files and HTML template
├── src/
│   ├── app/
│   │   └── store.js        # Redux store configuration
│   ├── components/         # Shared UI components
│   │   └── Footer.js       # Application footer with filters
│   ├── features/           # Feature-based organization
│   │   ├── todos/          # Todo feature
│   │   │   ├── todosSlice.js  # Todo state management
│   │   │   ├── TodoList.js    # List of todos
│   │   │   ├── TodoItem.js    # Individual todo item
│   │   │   └── TodoForm.js    # Form for adding todos
│   │   └── filters/        # Filtering feature
│   │       └── filtersSlice.js # Filter state management
│   ├── utils/              # Utility functions
│   │   ├── localStorage.js # Storage persistence utilities
│   │   └── validation.js   # Input validation helpers
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
└── package.json            # Project dependencies and scripts
```

## State Management

### Redux Implementation

The application uses Redux Toolkit for state management, with the following key components:

#### Store Configuration

The Redux store is configured in `src/app/store.js` using Redux Toolkit's `configureStore`. It combines reducers from different slices and includes middleware for localStorage persistence.

#### Todo Slice

The `todosSlice.js` file defines the core todo management functionality:

- **State**: Array of todo objects with `id`, `text`, and `completed` properties
- **Actions**: 
  - `addTodo`: Creates a new todo item
  - `toggleTodo`: Toggles the completed status
  - `editTodo`: Updates the text of an existing todo
  - `deleteTodo`: Removes a todo from the list
- **Selectors**:
  - `selectAllTodos`: Returns all todos
  - `selectFilteredTodos`: Returns todos filtered by status
  - `selectActiveTodoCount`: Returns count of active todos

#### Filter Slice

The `filtersSlice.js` manages the active filter:

- **State**: Current filter value (`all`, `active`, or `completed`)
- **Actions**:
  - `setFilter`: Updates the current filter
- **Selectors**:
  - `selectCurrentFilter`: Returns the active filter value

### LocalStorage Persistence

The application persists the Redux state to localStorage using a custom middleware solution:

1. On application load, the store is initialized with data from localStorage if available
2. When the state changes, the relevant portions are serialized and saved to localStorage
3. Error handling is implemented to gracefully handle storage failures

## Component Overview

### Key Components

#### App Component

The root component that orchestrates the layout and component hierarchy, handling application initialization including the loading of persisted data.

#### TodoForm Component

Provides user interface for creating new todo items:
- Captures and validates user input
- Dispatches the `addTodo` action when valid
- Provides visual feedback for validation errors

#### TodoList Component

Renders the filtered collection of todo items:
- Subscribes to filtered todos from Redux store
- Maps each todo to a TodoItem component
- Implements optimizations to prevent unnecessary re-renders

#### TodoItem Component

Displays an individual todo and provides interaction options:
- Toggle completion status with checkbox
- Edit todo text (double-click to activate edit mode)
- Delete todo with remove button
- Shows visual indication of completion state

#### Footer Component

Displays task summary information and filtering controls:
- Shows count of remaining active tasks
- Provides filter buttons (All, Active, Completed)
- Highlights the currently active filter

### Component Interactions

The components interact through Redux actions and state:
1. User actions in components dispatch Redux actions
2. Reducers process these actions to update the state
3. Components access the updated state via selectors
4. The UI re-renders to reflect state changes

## Testing Strategy

The application implements a comprehensive testing approach using Jest and React Testing Library:

### Unit Tests

- **Redux Logic Tests**: Verify action creators, reducers, and selectors behave correctly
- **Component Tests**: Ensure components render correctly and respond to user interactions
- **Utility Tests**: Validate helper functions work as expected

### Integration Tests

- Test component hierarchies together to verify proper data flow
- Validate Redux integration with components
- Test localStorage persistence mechanisms

### Sample Test Patterns

#### Redux Tests

```javascript
// Example reducer test
test('should handle addTodo', () => {
  const initialState = { entities: [] };
  const action = addTodo('New Todo');
  const newState = todosReducer(initialState, action);
  
  expect(newState.entities.length).toBe(1);
  expect(newState.entities[0].text).toBe('New Todo');
  expect(newState.entities[0].completed).toBe(false);
});
```

#### Component Tests

```javascript
// Example component test
test('toggles todo completion when checkbox clicked', () => {
  const todo = { id: '1', text: 'Test Todo', completed: false };
  const store = mockStore({ todos: { entities: [todo] } });
  
  render(
    <Provider store={store}>
      <TodoItem todo={todo} />
    </Provider>
  );
  
  fireEvent.click(screen.getByRole('checkbox'));
  const actions = store.getActions();
  
  expect(actions[0]).toEqual({
    type: 'todos/toggleTodo',
    payload: '1'
  });
});
```

## Build and Deployment

### Production Build

Create a production-ready build with:

```bash
npm run build
# or
yarn build