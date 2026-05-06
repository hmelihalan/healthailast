import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL || "postgresql://healthai:healthai_pass@localhost:5432/healthaidb";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')
  
  const passwordHash = await bcrypt.hash('password123', 10)

  // Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@healthai.edu' },
    update: { emailVerified: true },
    create: {
      email: 'admin@healthai.edu',
      passwordHash,
      role: 'Admin',
      city: 'Berlin',
      institution: 'Health AI Core',
      emailVerified: true,
    },
  })
  
  // Seed Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.smith@med.edu' },
    update: { emailVerified: true },
    create: {
      email: 'dr.smith@med.edu',
      passwordHash,
      role: 'Healthcare Professional',
      city: 'Munich',
      institution: 'Munich General Hospital',
      emailVerified: true,
    },
  })
  
  // Seed Engineer
  const engineer = await prisma.user.upsert({
    where: { email: 'dev.jones@tech.edu' },
    update: { emailVerified: true },
    create: {
      email: 'dev.jones@tech.edu',
      passwordHash,
      role: 'Engineer',
      city: 'Munich',
      institution: 'Tech University Munich',
      emailVerified: true,
    },
  })
  
  // Seed Post by Doctor
  await prisma.post.create({
    data: {
      title: 'Cardiology Imaging AI Model Validation',
      domain: 'Cardiology Imaging',
      requiredExpertise: 'Machine Learning, Computer Vision',
      projectStage: 'pilot testing',
      confidentialityLevel: 'Details discussed in meeting only',
      city: 'Munich',
      description: 'We have generated a novel dataset of 10,000 annotated echocardiograms. We are seeking an ML engineer to assist with training a segmentation model for clinical validation.',
      status: 'Active',
      ownerId: doctor.id,
    }
  })
  
  // Seed Post by Engineer
  await prisma.post.create({
    data: {
      title: 'Wearable ECG Monitor Software',
      domain: 'Wearables, Cardiology',
      requiredExpertise: 'Clinical Advisor, Workflow integration',
      projectStage: 'prototype developed',
      confidentialityLevel: 'Public short pitch',
      city: 'Berlin',
      description: 'We have a working prototype of a wearable ECG monitor but need a clinical advisor to help us understand the regulatory pathway and clinical workflow integration.',
      status: 'Active',
      ownerId: engineer.id,
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
