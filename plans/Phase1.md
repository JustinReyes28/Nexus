Phase 1: Project Foundation
[NEW] Project Initialization
nexus/
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── (auth)/ # Auth group routes
│ │ │ ├── login/
│ │ │ ├── register/
│ │ │ └── reset-password/
│ │ ├── (dashboard)/ # Protected dashboard routes
│ │ │ ├── dashboard/
│ │ │ ├── projects/
│ │ │ ├── ai-tools/
│ │ │ └── settings/
│ │ ├── api/ # API routes
│ │ └── layout.tsx
│ ├── components/ # Reusable UI components
│ │ ├── ui/ # Base components
│ │ ├── forms/ # Form components
│ │ └── dashboard/ # Dashboard-specific
│ ├── lib/ # Utility libraries
│ │ ├── auth.ts # NextAuth configuration
│ │ ├── db.ts # Prisma client
│ │ ├── ai.ts # Google AI client
│ │ └── email.ts # Nodemailer config
│ ├── hooks/ # Custom React hooks
│ ├── types/ # TypeScript types
│ └── styles/ # Global styles
├── prisma/
│ └── schema.prisma # Database schema
├── public/ # Static assets
├── .env.example # Environment template
├── next.config.mjs # Next.js configuration
├── tailwind.config.ts # Tailwind configuration
└── package.json
