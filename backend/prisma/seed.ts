import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('demo123', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@esencelab.com' },
    update: {},
    create: {
      email: 'student@esencelab.com',
      passwordHash,
      name: 'John Student',
      role: 'student',
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@esencelab.com' },
    update: {},
    create: {
      email: 'recruiter@esencelab.com',
      passwordHash,
      name: 'Jane Recruiter',
      role: 'recruiter',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@esencelab.com' },
    update: {},
    create: {
      email: 'admin@esencelab.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: 'job-1' },
      update: {},
      create: {
        id: 'job-1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'We are looking for a skilled software engineer to join our team.',
        requirements: 'Python, JavaScript, React, Node.js, SQL',
        location: 'New York, NY',
        salaryMin: 80000,
        salaryMax: 120000,
        jobType: 'full_time',
        status: 'active',
        recruiterId: recruiter.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-2' },
      update: {},
      create: {
        id: 'job-2',
        title: 'Data Scientist',
        company: 'Data Inc',
        description: 'Join our data science team to build ML models.',
        requirements: 'Python, Machine Learning, TensorFlow, SQL, Statistics',
        location: 'San Francisco, CA',
        salaryMin: 100000,
        salaryMax: 150000,
        jobType: 'full_time',
        status: 'active',
        recruiterId: recruiter.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-3' },
      update: {},
      create: {
        id: 'job-3',
        title: 'Frontend Developer',
        company: 'Web Solutions',
        description: 'Build beautiful web applications.',
        requirements: 'React, TypeScript, CSS, HTML, JavaScript',
        location: 'Remote',
        salaryMin: 60000,
        salaryMax: 90000,
        jobType: 'full_time',
        status: 'active',
        recruiterId: recruiter.id,
      },
    }),
  ]);

  const courses = await Promise.all([
    prisma.course.upsert({
      where: { id: 'course-1' },
      update: {},
      create: {
        id: 'course-1',
        title: 'Complete Python Bootcamp',
        description: 'Learn Python from scratch to advanced concepts.',
        instructor: 'Dr. Angela Yu',
        url: 'https://example.com/courses/python',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-2' },
      update: {},
      create: {
        id: 'course-2',
        title: 'React - The Complete Guide',
        description: 'Master React.js including hooks, Redux, and more.',
        instructor: 'Maximilian Schwarzmuller',
        url: 'https://example.com/courses/react',
      },
    }),
  ]);

  console.log('Seeding completed!');
  console.log('Created demo accounts:');
  console.log('- student@esencelab.com / demo123');
  console.log('- recruiter@esencelab.com / demo123');
  console.log('- admin@esencelab.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
