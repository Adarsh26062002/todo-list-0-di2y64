# Contributing to Todo List Application

Thank you for your interest in contributing to the Todo List application! This document outlines the process for contributing to the project and helps ensure a smooth collaboration experience.

We welcome contributions in the form of bug reports, feature requests, code contributions, and documentation improvements. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Code of Conduct

Our project adheres to a Code of Conduct that sets expectations for participation in our community. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before engaging with the project. We expect all contributors to:

- Be respectful and inclusive of differing viewpoints and experiences
- Give and receive constructive feedback gracefully
- Focus on what is best for the community and project
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 16.x or higher)
- npm (version 8.x or higher) or Yarn (version 1.22.x or higher)

### Repository Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/username/todo-list-app.git
cd todo-list-app
npm install
```

3. Add the original repository as an upstream remote:

```bash
git remote add upstream https://github.com/original-owner/todo-list-app.git
```

4. Start the development server:

```bash
npm start
```

## Development Workflow

Our development process follows these steps:

1. Create a feature branch from the `main` branch
2. Implement your changes, with appropriate tests
3. Ensure your code passes all tests and meets our coding standards
4. Submit a pull request

### Branch Naming Convention

Use the following format for branch names:

- `feature/short-description` - For new features
- `bugfix/issue-description` - For bug fixes
- `docs/update-area` - For documentation updates
- `refactor/component-name` - For code refactoring
- `test/component-name` - For test improvements

Examples:
- `feature/filter-todos`
- `bugfix/fix-persistence-issue`
- `docs/update-readme`

### Making Changes

1. Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes, writing tests as needed
3. Run tests to ensure everything works:

```bash
npm test
```

4. Format and lint your code:

```bash
npm run format
npm run lint
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) format for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
- `feat(todos): add ability to filter by status`
- `fix(persistence): resolve localStorage saving issue`
- `docs: update setup instructions in README`

Reference issues in your commits when applicable:
- `fix(ui): resolve button alignment issue (fixes #42)`

## Coding Standards

We maintain consistent code quality through established standards and automated tools.

### TypeScript

We use TypeScript for type safety. Ensure:

- All new code is written in TypeScript
- Proper interfaces/types are defined for components, state, and props
- No use of `any` type unless absolutely necessary

Here's an example of a well-structured component:

```typescript
// TodoItem.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleTodo } from '../features/todos/todosSlice';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ id, text, completed }) => {
  const dispatch = useDispatch();
  
  return (
    <li className={completed ? 'completed' : ''}>
      <input 
        type="checkbox" 
        checked={completed}
        onChange={() => dispatch(toggleTodo(id))}
      />
      <span>{text}</span>
    </li>
  );
};

export default TodoItem;
```

### ESLint and Prettier

We use ESLint and Prettier to maintain code quality and style consistency:

- ESLint enforces coding best practices
- Prettier ensures consistent formatting

Before submitting code, run:

```bash
npm run lint
npm run format
```

You can also set up your editor to use our ESLint and Prettier configurations.

### Component Guidelines

- Each component should have a single responsibility
- Use functional components with hooks rather than class components
- Place related files (component, tests, styles) together
- Include JSDoc comments for component props and important functions
- Follow the established naming conventions:
  - PascalCase for component files and function names
  - camelCase for regular functions and variables
  - UPPER_SNAKE_CASE for constants

## Testing Requirements

All code contributions should include appropriate tests.

### Unit Testing

- Test all utility functions and hooks
- Test Redux reducers, actions, and selectors
- Aim for single responsibility in tests - one assertion per test when possible

### Component Testing

- Test that components render correctly with different props
- Test user interactions (clicks, inputs, etc.)
- Test Redux interactions using mock stores

Example component test:

```typescript
// TodoItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TodoItem from './TodoItem';

describe('TodoItem Component', () => {
  const mockStore = configureStore([]);
  const todo = { id: '1', text: 'Test Todo', completed: false };
  
  test('renders todo text correctly', () => {
    const store = mockStore({ todos: { entities: [todo] } });
    render(
      <Provider store={store}>
        <TodoItem {...todo} />
      </Provider>
    );
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });
});
```

### Test Coverage

- Maintain minimum 80% overall code coverage
- 90% coverage for core Redux state management
- 85% coverage for UI components
- Before submitting a PR, run tests with coverage to ensure requirements are met:

```bash
npm test -- --coverage
```

## Directory Structure

Our project follows a feature-based directory structure:

```
todo-app/
├── src/
│   ├── app/
│   │   ├── hooks.ts
│   │   └── store.ts
│   ├── features/
│   │   ├── todos/
│   │   │   ├── todosSlice.ts
│   │   │   └── tests/
│   │   └── filters/
│   │       ├── filtersSlice.ts
│   │       └── tests/
│   ├── components/
│   │   ├── TodoItem/
│   │   ├── TodoList/
│   │   ├── TodoForm/
│   │   ├── Footer/
│   │   └── ErrorBoundary/
│   ├── utils/
│   │   ├── localStorage.ts
│   │   └── validation.ts
│   ├── styles/
│   ├── App.tsx
│   └── index.tsx
└── public/
```

Key organization principles:
- Group code by feature rather than type
- Keep related files close to each other
- Place shared utilities in the utils directory
- Use index files to simplify imports

When adding new components or features:
- Follow the existing patterns and naming conventions
- Place tests alongside the files they test or in a dedicated `tests` folder within the feature directory
- Create new files in the appropriate directory based on functionality

## Pull Request Process

1. Ensure your code follows our guidelines and passes all tests
2. Update documentation as needed for your changes
3. Submit a pull request using the [PR template](.github/PULL_REQUEST_TEMPLATE.md)
4. Address any feedback from code reviews
5. Once approved, a maintainer will merge your PR

PR guidelines:
- Keep PRs focused on a single concern
- Reference related issues in the PR description
- Write a clear description explaining the purpose and implementation approach
- Add screenshots for UI changes
- Ensure all CI checks pass

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/environment information
- Potential solution if you have ideas

### Feature Requests

For feature requests, please include:

- A clear, descriptive title
- A detailed description of the proposed feature
- Explanation of why this feature would be valuable
- Any implementation ideas you have
- Mockups or examples if applicable

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode at http://localhost:3000
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production to the `build` folder
- `npm run lint` - Runs ESLint to check for code issues
- `npm run format` - Formats code using Prettier
- `npm run coverage` - Runs tests with coverage reporting

Thanks for contributing to the Todo List application!