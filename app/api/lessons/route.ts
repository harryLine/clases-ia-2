import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const createLessonSchema = z.object({
  date: z.string().date(),
  title: z.string().trim().min(1),
  contentHtml: z.string().optional().default('<p></p>')
});

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { date: 'desc' },
    include: {
      resources: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return NextResponse.json(lessons);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createLessonSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }

  const lesson = await prisma.lesson.create({
    data: {
      date: new Date(`${parsed.data.date}T00:00:00.000Z`),
      title: parsed.data.title,
      contentHtml: parsed.data.contentHtml
    },
    include: { resources: true }
  });

  return NextResponse.json(lesson, { status: 201 });
}
