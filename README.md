# Gestión de clases (Next.js + Prisma + PostgreSQL)

Aplicación web minimalista para gestionar clases con editor rich text, recursos por clase y exportaciones (copiar email y descargar HTML).

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Prisma + PostgreSQL
- TipTap para edición WYSIWYG

## Requisitos

- Node.js 18+
- Base de datos PostgreSQL (por ejemplo Neon)

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` a partir de `.env.example` y configura `DATABASE_URL`.

3. Genera cliente de Prisma y aplica esquema:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Arranca en desarrollo:

```bash
npm run dev
```

## Modelos Prisma

- `Lesson`: clase con fecha, título y contenido HTML (`contentHtml`)
- `ResourceLink`: links relacionados a una clase (relación 1-N con cascade delete)

## Deploy Codex → GitHub → Vercel

### 1) Neon (PostgreSQL)

1. Crea un proyecto en Neon.
2. Copia la connection string de PostgreSQL (formato `postgresql://...`).
3. Verifica que tenga SSL (`?sslmode=require`).

### 2) GitHub

1. Sube el repositorio a GitHub.
2. Mantén `main` como rama de producción.
3. Trabaja en ramas para PRs (Vercel genera Preview por cada PR).

### 3) Vercel

1. Importa el repo en Vercel.
2. En **Project Settings → Environment Variables**, agrega:
   - `DATABASE_URL` (misma URL de Neon)
3. En **Build & Development Settings**, deja el comando por defecto (`next build`).
4. Cada Pull Request generará un **Preview Deployment** automáticamente.
5. Al hacer merge a `main`, Vercel publicará en **Production**.

## Endpoints incluidos

- `GET /api/lessons` → listar clases (date DESC)
- `POST /api/lessons` → crear clase
- `PUT /api/lessons/:id` → actualizar clase
- `DELETE /api/lessons/:id` → eliminar clase
- `POST /api/resource-links` → añadir recurso
- `DELETE /api/resource-links/:id` → borrar recurso

## Notas

- No incluye autenticación por diseño.
- El contenido se guarda como HTML en `contentHtml`.
- El botón **Copiar email** usa Clipboard API con HTML y fallback a texto.
- El botón **Descargar HTML** exporta un archivo autónomo con estilos inline mínimos.
