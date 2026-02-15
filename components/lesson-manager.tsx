'use client';

import { useEffect, useMemo, useState } from 'react';

import { formatLessonDate, toDateInputValue, escapeHtml } from '@/lib/format';
import type { Lesson, ResourceLink } from '@/lib/types';
import { RichTextEditor } from './rich-text-editor';

type LessonDraft = {
  date: string;
  title: string;
  contentHtml: string;
};

const emptyDraft: LessonDraft = {
  date: new Date().toISOString().split('T')[0],
  title: '',
  contentHtml: '<p></p>'
};

export function LessonManager() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LessonDraft>(emptyDraft);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [status, setStatus] = useState<string>('');

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedId) ?? null,
    [lessons, selectedId]
  );

  async function loadLessons() {
    const response = await fetch('/api/lessons', { cache: 'no-store' });
    if (!response.ok) return;

    const data = (await response.json()) as Lesson[];
    setLessons(data);

    const current = data.find((lesson) => lesson.id === selectedId);
    if (!current && data.length > 0) {
      setSelectedId(data[0].id);
      setDraft({
        date: toDateInputValue(data[0].date),
        title: data[0].title,
        contentHtml: data[0].contentHtml
      });
    }
    if (data.length === 0) {
      setSelectedId(null);
      setDraft(emptyDraft);
    }
  }

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      setDraft({
        date: toDateInputValue(selectedLesson.date),
        title: selectedLesson.title,
        contentHtml: selectedLesson.contentHtml
      });
    }
  }, [selectedLesson]);

  async function createLesson() {
    const response = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        title: 'Nueva clase',
        contentHtml: '<p></p>'
      })
    });

    if (!response.ok) {
      setStatus('No se pudo crear la clase.');
      return;
    }

    const created = (await response.json()) as Lesson;
    await loadLessons();
    setSelectedId(created.id);
    setStatus('Clase creada.');
  }

  async function saveLesson() {
    if (!selectedId) return;
    if (!draft.date || !draft.title.trim()) {
      setStatus('Fecha y título son obligatorios.');
      return;
    }

    const response = await fetch(`/api/lessons/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: draft.date,
        title: draft.title,
        contentHtml: draft.contentHtml
      })
    });

    if (!response.ok) {
      setStatus('No se pudo guardar.');
      return;
    }

    setStatus('Clase guardada.');
    await loadLessons();
  }

  async function deleteLesson() {
    if (!selectedId) return;

    const confirmed = window.confirm('¿Eliminar esta clase?');
    if (!confirmed) return;

    const response = await fetch(`/api/lessons/${selectedId}`, { method: 'DELETE' });
    if (!response.ok) {
      setStatus('No se pudo eliminar.');
      return;
    }

    setStatus('Clase eliminada.');
    await loadLessons();
  }

  async function addResource() {
    if (!selectedId) return;
    if (!resourceName.trim() || !resourceUrl.trim()) {
      setStatus('Nombre y URL son obligatorios.');
      return;
    }

    const response = await fetch('/api/resource-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: selectedId,
        name: resourceName,
        url: resourceUrl
      })
    });

    if (!response.ok) {
      setStatus('Revisa la URL del recurso.');
      return;
    }

    setResourceName('');
    setResourceUrl('');
    await loadLessons();
    setStatus('Recurso añadido.');
  }

  async function removeResource(resourceId: string) {
    const response = await fetch(`/api/resource-links/${resourceId}`, { method: 'DELETE' });
    if (!response.ok) {
      setStatus('No se pudo borrar el recurso.');
      return;
    }

    await loadLessons();
    setStatus('Recurso eliminado.');
  }

  async function copyEmail() {
    if (!selectedLesson) return;
    const subject = `Domingos IA: ${toDateInputValue(selectedLesson.date)} - ${selectedLesson.title}`;

    const resourcesHtml = selectedLesson.resources.length
      ? `<h3>Recursos</h3><ul>${selectedLesson.resources
          .map((resource) => `<li><a href="${resource.url}">${escapeHtml(resource.name)}</a></li>`)
          .join('')}</ul>`
      : '';

    const html = `<h2>${escapeHtml(selectedLesson.title)}</h2>${selectedLesson.contentHtml}${resourcesHtml}`;
    const text = `${subject}\n\n${selectedLesson.resources
      .map((resource) => `${resource.name}: ${resource.url}`)
      .join('\n')}`;

    try {
      if ('ClipboardItem' in window) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' })
          })
        ]);
      } else {
        await navigator.clipboard.writeText(`${subject}\n\n${html}`);
      }
      setStatus('Email copiado al portapapeles.');
    } catch {
      setStatus('No se pudo copiar al portapapeles.');
    }
  }

  function downloadHtml() {
    if (!selectedLesson) return;

    const resourcesSection = selectedLesson.resources.length
      ? `<h2>Recursos</h2><ul>${selectedLesson.resources
          .map(
            (resource) =>
              `<li><a href="${resource.url}">${escapeHtml(resource.name)}</a> — ${escapeHtml(resource.url)}</li>`
          )
          .join('')}</ul>`
      : '<p><em>Sin recursos.</em></p>';

    const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(selectedLesson.title)}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 840px; margin: 2rem auto; line-height: 1.6; color: #0f172a; padding: 0 1rem;">
  <h1 style="margin-bottom: 0.25rem;">${escapeHtml(selectedLesson.title)}</h1>
  <p style="margin-top:0; color:#475569;"><strong>Fecha:</strong> ${toDateInputValue(selectedLesson.date)}</p>
  <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;" />
  ${selectedLesson.contentHtml}
  <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;" />
  ${resourcesSection}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${toDateInputValue(selectedLesson.date)}-${selectedLesson.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-100 text-slate-900 md:grid-cols-[320px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Clases</h1>
          <button
            type="button"
            className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
            onClick={createLesson}
          >
            + Nueva clase
          </button>
        </div>

        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => setSelectedId(lesson.id)}
                className={`w-full rounded border px-3 py-2 text-left text-sm ${
                  selectedId === lesson.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-100'
                }`}
              >
                {formatLessonDate(lesson.date)} · {lesson.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="p-6">
        {!selectedLesson ? (
          <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Crea tu primera clase para empezar.
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Fecha
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={draft.date}
                  onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                />
              </label>

              <label className="text-sm font-medium">
                Título
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
            </div>

            <section>
              <p className="mb-1 text-sm font-medium">Contenido</p>
              <RichTextEditor
                content={draft.contentHtml}
                onChange={(html) => setDraft((prev) => ({ ...prev, contentHtml: html }))}
              />
            </section>

            <section className="space-y-2">
              <p className="text-sm font-medium">Recursos</p>
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  value={resourceName}
                  onChange={(event) => setResourceName(event.target.value)}
                  placeholder="Nombre"
                  className="rounded border border-slate-300 px-3 py-2"
                />
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(event) => setResourceUrl(event.target.value)}
                  placeholder="https://..."
                  className="rounded border border-slate-300 px-3 py-2"
                />
                <button
                  type="button"
                  className="rounded border border-slate-300 px-3 py-2 hover:bg-slate-100"
                  onClick={addResource}
                >
                  Añadir recurso
                </button>
              </div>

              <ul className="space-y-2">
                {selectedLesson.resources.map((resource: ResourceLink) => (
                  <li
                    key={resource.id}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm"
                  >
                    <a className="text-blue-700 underline" href={resource.url} target="_blank" rel="noreferrer">
                      {resource.name}
                    </a>
                    <button
                      type="button"
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      onClick={() => removeResource(resource.id)}
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={saveLesson}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={copyEmail}
                className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
              >
                Copiar email
              </button>
              <button
                type="button"
                onClick={downloadHtml}
                className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
              >
                Descargar HTML
              </button>
              <button
                type="button"
                onClick={deleteLesson}
                className="rounded border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>

            {status ? <p className="text-sm text-slate-500">{status}</p> : null}
          </div>
        )}
      </main>
    </div>
  );
}
