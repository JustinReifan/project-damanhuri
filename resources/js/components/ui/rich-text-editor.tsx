import { Bold, Italic, Strikethrough, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    className?: string;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                'hover:bg-zinc-700/50 disabled:cursor-not-allowed disabled:opacity-50',
                isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
        >
            {children}
        </button>
    );
}

function EditorLoading() {
    return (
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
            <div className="h-[200px] animate-pulse bg-zinc-700/30 rounded" />
        </div>
    );
}

export function RichTextEditor({ value, onChange, error, placeholder, className }: RichTextEditorProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [editor, setEditor] = useState<any>(null);
    const [EditorContent, setEditorContent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        setIsMounted(true);
        
        // Load tiptap modules dynamically on client
        if (typeof window !== 'undefined') {
            Promise.all([
                import('@tiptap/react'),
                import('@tiptap/starter-kit')
            ]).then(([tiptapReact, starterKit]) => {
                const { Editor } = tiptapReact;
                setEditorContent(() => tiptapReact.EditorContent);
                
                const editorInstance = new Editor({
                    extensions: [
                        starterKit.default.configure({
                            paragraph: {
                                HTMLAttributes: { class: 'mb-2' },
                            },
                            bulletList: {
                                HTMLAttributes: { class: 'list-disc pl-4 mb-2' },
                            },
                            orderedList: {
                                HTMLAttributes: { class: 'list-decimal pl-4 mb-2' },
                            },
                        }),
                    ],
                    content: value,
                    editorProps: {
                        attributes: {
                            class: cn(
                                'prose prose-invert max-w-none min-h-[200px] p-3 outline-none',
                                'prose-p:my-1 prose-ul:my-1 prose-ol:my-1',
                                'prose-li:my-0.5'
                            ),
                        },
                    },
                    onUpdate: ({ editor: e }) => {
                        onChange(e.getHTML());
                    },
                });
                setEditor(editorInstance);
            });
        }
        
        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, []);

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!isMounted || !editor || !EditorContent) {
        return <EditorLoading />;
    }

    return (
        <div className={cn('space-y-1', className)}>
            <div
                className={cn(
                    'rounded-lg border bg-primary/10 backdrop-blur-sm transition-colors',
                    error ? 'border-red-500/50' : 'border-zinc-700/50 focus-within:border-cyan-400'
                )}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-zinc-700/50 p-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="mx-1 h-6 w-px bg-zinc-700/50" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="mx-1 h-6 w-px bg-zinc-700/50" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                {/* Editor Content */}
                <EditorContent 
                    editor={editor} 
                    className="text-foreground [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0"
                />
            </div>

            {error && <p className="font-mono text-sm text-red-400">{error}</p>}
        </div>
    );
}
