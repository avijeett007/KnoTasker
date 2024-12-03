# KnoTasker - Modern Task Management Platform

<div align="center">
  <a href="https://youtu.be/TmUOdV8Pt-o?si=YzY1QmVnE2qAzWD9">
    <img src="https://img.youtube.com/vi/TmUOdV8Pt-o/maxresdefault.jpg" alt="Watch the Tutorial" style="max-width:100%;">
  </a>
  <p><em>Click the image above to watch the tutorial!</em></p>
</div>

KnoTasker is a modern, full-stack task management application built using cutting-edge technologies and AI-powered development tools. This project showcases the power of combining Replit AI Agent and Windsurf AI IDE to create a professional-grade application efficiently.

## 🌟 Features

- 🎨 Modern, responsive UI with dark/light theme support
- 📱 Kanban board for intuitive task management
- 👥 Multi-user collaboration
- 🔒 Secure authentication system
- 📂 Project organization with customizable workflows
- 🎯 Real-time updates and notifications
- 💾 PostgreSQL database with Drizzle ORM
- 🚀 Express.js backend with TypeScript

## 🛠 Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn/ui components
- Framer Motion for animations
- React Query for state management

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Drizzle ORM
- Docker for containerization

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/knotasker.git
cd knotasker
\`\`\`

2. Install dependencies
\`\`\`bash
# Install backend dependencies
cd server
pnpm install

# Install frontend dependencies
cd ../client
pnpm install
\`\`\`

3. Set up environment variables
\`\`\`bash
# In the server directory, create a .env file
cp .env.example .env

# Update the following variables
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/knotasker
SESSION_SECRET=your_session_secret
PORT=4000
\`\`\`

4. Start PostgreSQL using Docker
\`\`\`bash
docker-compose up -d
\`\`\`

5. Run database migrations
\`\`\`bash
cd server
pnpm db:push
\`\`\`

6. Start the development servers
\`\`\`bash
# Start backend server (in server directory)
pnpm dev

# Start frontend server (in client directory)
cd ../client
pnpm dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 🎥 Tutorial

This project was created as part of a tutorial series demonstrating the power of AI-assisted development. Watch the full tutorial to learn how this application was built:

[![KnoTasker Tutorial](https://img.youtube.com/vi/TmUOdV8Pt-o/0.jpg)](https://youtu.be/TmUOdV8Pt-o?si=YzY1QmVnE2qAzWD9)

### Community and Support
- Join our community: [Kno2gether Community](https://community.kno2gether.com)
- Full Course (50% OFF): [End-to-End SaaS Launch Course](https://knolabs.biz/course-at-discount)

### Hosting Partners
- [Kamatera - Get $100 Free VPS Credit](https://knolabs.biz/100-dollar-free-credit)
- [Hostinger - Additional 20% Discount](https://knolabs.biz/20-Percent-Off-VPS)

## 📺 Video Tutorials

Follow along with our detailed video tutorials on the [Kno2gether YouTube Channel](https://youtube.com/@kno2gether) for step-by-step guidance and best practices.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Replit AI Agent](https://replit.com)
- Developed using [Windsurf AI IDE](https://windsurf.io)
- Channel: [kno2gether](https://www.youtube.com/@kno2gether)
