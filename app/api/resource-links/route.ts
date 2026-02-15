import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const createResourceSchema = z.object({
  lessonId: z.string().min(1),
  name: z.string().trim().min(1),
  url: z.string().trim().url()
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createResourceSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }

  const resource = await prisma.resourceLink.create({
    data: parsed.data
  });

  return NextResponse.json(resource, { status: 201 });
}
