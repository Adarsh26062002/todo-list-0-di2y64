# Todo List Application

[![Build Status](https://img.shields.io/github/workflow/status/username/todo-list-app/CI)](https://github.com/username/todo-list-app/actions)
[![Coverage Status](https://img.shields.io/codecov/c/github/username/todo-list-app)](https://codecov.io/gh/username/todo-list-app)
[![License](https://img.shields.io/github/license/username/todo-list-app)](LICENSE)

A full-featured Todo List application built with React and Redux, offering comprehensive task management capabilities with a modern user interface.

## Technology Stack

- React 18.x
- Redux 4.x
- Redux Toolkit 1.9.x
- TypeScript
- CSS3
- localStorage for persistence

## Features

- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Filter tasks by status (All, Active, Completed)
- Data persistence between sessions using localStorage
- Responsive design for mobile and desktop
- Form validation for todo entries

## Demo

[View live demo](https://todo-list-app-demo.example.com)

## Getting Started

### Prerequisites

- Node.js v16.x or higher
- npm 8+ or Yarn 1.22+

### Installation

```bash
# Clone the repository
git clone https://github.com/username/todo-list-app.git
cd todo-list-app

# Install dependencies
npm install

# Or with yarn
yarn install
```

## Usage

### Development

```bash
# Start development server
npm start

# Or with yarn
yarn start
```

The application will be available at http://localhost:3000

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Build

```bash
# Build for production
npm run build
```

Production files will be generated in the build/ directory

## Project Structure

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

The project follows a feature-based structure using the Redux Toolkit recommended patterns.

## Deployment

The application can be deployed to various static hosting services:

### Vercel

Configuration provided in infrastructure/vercel.json

### Netlify

Configuration provided in infrastructure/netlify.toml

### AWS S3 + CloudFront

Configuration provided in infrastructure/cloudfront-distribution.json and infrastructure/s3-bucket-policy.json

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.