# Nexus - AI-Powered Capstone Companion

![Nexus Logo](https://via.placeholder.com/150) <!-- Replace with actual logo -->

**Your AI-Powered Capstone Companion** - Guiding students through every stage of their capstone projects with intelligent assistance.

## 🚀 About Nexus

Nexus is an intelligent web platform designed to guide students through every stage of their capstone projects—from ideation to completion. By leveraging AI capabilities, Nexus provides personalized mentorship, research assistance, project management tools, and collaborative features to help students successfully navigate one of their most challenging academic milestones.

## 🎯 Target Audience

- Undergraduate and graduate students working on capstone projects
- Academic institutions looking for student success tools
- Student groups collaborating on team-based capstones

## ✨ Key Features

### 🤖 AI-Powered Features

- **Idea Generator & Validator**: Generate and validate capstone project ideas
- **Research Assistant**: Get literature review suggestions and research guidance
- **Proposal Writer**: Interactive proposal builder with AI suggestions
- **Methodology Advisor**: Recommendations for research methodologies
- **Progress Analyzer**: Identify bottlenecks and suggest next steps
- **Writing Assistant**: Grammar, style, and academic tone improvements

### 📊 Project Management

- **Dashboard**: Visual progress tracking with milestones
- **Task & Milestone Manager**: Gantt chart visualization with deadline reminders
- **Document Repository**: Version-controlled document storage

### 👥 Collaboration Features

- **Team Workspaces**: Shared project spaces with role-based permissions
- **Advisor Communication**: Structured feedback request system
- **Real-time Collaboration**: Team chat and discussion threads

### 📚 Resource Library

- **Template Center**: Proposal templates by discipline
- **Knowledge Base**: Best practices and sample projects
- **Video Tutorials**: Step-by-step guidance

## 🛠️ Technical Stack

### Frontend

- **Next.js** (App Router) with **React 18+**
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **TanStack Query** for server state management
- **Zod** for runtime type validation

### Backend

- **Next.js API Routes**
- **MongoDB** with **Prisma ORM**
- **Upstash Redis** for caching
- **Google AI Studio API** for AI features

### Authentication

- **NextAuth.js** with Google OAuth
- **Email/password authentication**
- **Session management with secure tokens**

## 📁 Project Structure

```
nexus/
├── .gitignore
├── README.md
├── PRD1.md          # Product Requirements Document
├── PRD2.md          # Additional requirements (empty)
├── PRD3.md          # Additional requirements (empty)
├── PRD4.md          # Additional requirements (empty)
├── Security.md      # Security requirements
└── # Future directories will include:
    ├── src/         # Source code
    ├── public/      # Static assets
    ├── prisma/      # Database schema
    └── # etc.
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- MongoDB Atlas account
- Google AI Studio API key
- Vercel account (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/JustinReyes28/Nexus.git
   cd Nexus
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   (Create `.env.example` with required variables)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexus

# Google AI
GOOGLE_AI_API_KEY=your-api-key

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# SMTP (for email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📖 Documentation

- [PRD1.md](PRD1.md) - Complete Product Requirements Document
- [Security.md](Security.md) - Security and Privacy Requirements

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

For questions or support, please contact:

- **Project Lead**: Justin Reyes
- **GitHub**: [JustinReyes28](https://github.com/JustinReyes28)
- **Email**: justin.reyes@example.com

---

**Nexus** - Empowering students to succeed in their capstone projects with AI-assisted guidance and comprehensive project management tools.
