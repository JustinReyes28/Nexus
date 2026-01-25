import { PrismaClient } from '@prisma/client';
import { getCreditLimitForTier } from '../src/lib/creditLimits';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default values...');
  
  const tierConfigs = [
    { tier: 'FREE' as const },
    { tier: 'PREMIUM' as const },
    // Add future tiers here
  ];

  for (const config of tierConfigs) {
    const limit = getCreditLimitForTier(config.tier);
    const result = await prisma.user.updateMany({
      where: { 
        tier: config.tier,
        aiCreditsLimit: { not: limit } 
      },
      data: { aiCreditsLimit: limit }
    });

    if (result.count > 0) {
      console.log(`Updated ${result.count} ${config.tier} users to have correct credit limit (${limit})`);
    } else {
      console.log(`All ${config.tier} users already have correct credit limits.`);
    }
  }

  // Seed Templates
  console.log('Seeding project templates...');
  const templates = [
    {
      title: "Computer Science Capstone",
      description: "A comprehensive structure for software engineering and research-oriented CS projects.",
      category: "Computer Science",
      discipline: "Computer Science",
      content: JSON.stringify([
        { title: "Project Proposal", description: "Define goals, scope, and technical requirements.", priority: "HIGH", daysAfterStart: 7 },
        { title: "Requirements Analysis", description: "Document functional and non-functional requirements.", priority: "MEDIUM", daysAfterStart: 14 },
        { title: "System Architecture Design", description: "Design the high-level architecture and database schema.", priority: "HIGH", daysAfterStart: 21 },
        { title: "MVP Implementation", description: "Build the core functionality of the system.", priority: "HIGH", daysAfterStart: 45 },
        { title: "Testing & QA", description: "Perform unit, integration, and user acceptance testing.", priority: "MEDIUM", daysAfterStart: 60 },
        { title: "Final Documentation", description: "Complete the technical report and user manual.", priority: "MEDIUM", daysAfterStart: 80 },
        { title: "Presentation Preparation", description: "Prepare slides and demo for the final defense.", priority: "MEDIUM", daysAfterStart: 90 }
      ]),
      ownerId: null, // Public template
      visibility: "PUBLIC"
    },
    {
      title: "Business Venture Plan",
      description: "Structured approach for creating a business plan, market analysis, and financial projections.",
      category: "Business",
      discipline: "Business",
      content: JSON.stringify([
        { title: "Executive Summary", description: "Brief overview of the business concept and goals.", priority: "HIGH", daysAfterStart: 7 },
        { title: "Market Research", description: "Analyze target market, competitors, and industry trends.", priority: "HIGH", daysAfterStart: 21 },
        { title: "Marketing Strategy", description: "Define branding, pricing, and promotion plans.", priority: "MEDIUM", daysAfterStart: 35 },
        { title: "Operational Plan", description: "Detail daily operations, suppliers, and logistics.", priority: "MEDIUM", daysAfterStart: 45 },
        { title: "Financial Projections", description: "Develop income statements, balance sheets, and cash flow.", priority: "HIGH", daysAfterStart: 60 },
        { title: "Risk Management", description: "Identify potential risks and mitigation strategies.", priority: "MEDIUM", daysAfterStart: 70 },
        { title: "Final Pitch Deck", description: "Create a compelling presentation for investors or judges.", priority: "HIGH", daysAfterStart: 85 }
      ]),
      ownerId: null, // Public template
      visibility: "PUBLIC"
    },
    {
      title: "Engineering Design Project",
      description: "Phases for prototype development, testing, and engineering documentation.",
      category: "Engineering",
      discipline: "Engineering",
      content: JSON.stringify([
        { title: "Problem Definition", description: "Identify the engineering challenge and constraints.", priority: "HIGH", daysAfterStart: 7 },
        { title: "Literature Review", description: "Research existing solutions and relevant standards.", priority: "MEDIUM", daysAfterStart: 21 },
        { title: "Conceptual Design", description: "Brainstorm and evaluate potential design concepts.", priority: "HIGH", daysAfterStart: 35 },
        { title: "Detailed Engineering Design", description: "Create CAD models, circuit diagrams, and parts lists.", priority: "HIGH", daysAfterStart: 50 },
        { title: "Prototype Construction", description: "Build the first physical or functional prototype.", priority: "HIGH", daysAfterStart: 75 },
        { title: "Performance Testing", description: "Verify prototype against design requirements.", priority: "MEDIUM", daysAfterStart: 85 },
        { title: "Final Report & Demo", description: "Document design process and demonstrate the prototype.", priority: "HIGH", daysAfterStart: 100 }
      ]),
      ownerId: null, // Public template
      visibility: "PUBLIC"
    }
  ];

  for (const template of templates) {
    const existing = await prisma.template.findFirst({
      where: { title: template.title }
    });
    
    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: {
          title: template.title,
          description: template.description,
          category: template.category,
          discipline: template.discipline,
          content: template.content,
          ownerId: template.ownerId,
          visibility: template.visibility
        }
      });
    } else {
      await prisma.template.create({
        data: template
      });
    }
  }


  
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });