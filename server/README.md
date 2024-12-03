# KnoTasker Server

This is the backend server for KnoTasker, featuring AI-powered task generation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

4. Start the development server:
```bash
npm run dev
```

## AI Task Generation

The server includes an AI-powered task generation feature that uses OpenAI's GPT model to break down project requirements into specific, actionable tasks.

### How it works:

1. The AI endpoint receives a project description
2. It uses GPT to analyze the description and break it down into tasks
3. Each generated task includes:
   - A clear, concise title
   - A detailed description
   - Automatically set to "TODO" status

### Example prompt:
"I want to create a blog website with user authentication, comments, and a rich text editor"

### Example response:
```json
{
  "tasks": [
    {
      "title": "Set up user authentication system",
      "description": "Implement user registration and login functionality using JWT tokens"
    },
    {
      "title": "Create blog post editor",
      "description": "Integrate a rich text editor component for creating and editing blog posts"
    },
    {
      "title": "Implement commenting system",
      "description": "Add the ability for users to comment on blog posts and manage their comments"
    }
  ]
}
```
