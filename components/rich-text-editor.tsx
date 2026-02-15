'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

type Props = {
  content: string;
  onChange: (html: string) => void;
};

const toolbarButton = 'rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-100';

export function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https']
      }),
      Code,
      CodeBlock,
      Placeholder.configure({
        placeholder: 'Contenido de la clase...'
      })
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[320px] rounded-b-md border border-t-0 border-slate-200 bg-white p-4 focus:outline-none'
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previousUrl ?? 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-t-md border border-slate-200 bg-slate-50 p-2">
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lista</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Cita</button>
        <button type="button" className={toolbarButton} onClick={setLink}>Link</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleCode().run()}>Código</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Bloque código</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().undo().run()}>↶</button>
        <button type="button" className={toolbarButton} onClick={() => editor.chain().focus().redo().run()}>↷</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
