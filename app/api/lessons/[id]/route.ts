import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const updateLessonSchema = z.object({
  date: z.string().date(),
  title: z.string().trim().min(1),
  contentHtml: z.string().default('<p></p>')
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const json = await request.json();
  const parsed = updateLessonSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }

  const updated = await prisma.lesson.update({
    where: { id: params.id },
    data: {
      date: new Date(`${parsed.data.date}T00:00:00.000Z`),
      title: parsed.data.title,
      contentHtml: parsed.data.contentHtml
    },
    include: {
      resources: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
