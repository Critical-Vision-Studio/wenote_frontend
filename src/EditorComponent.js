import React from "react";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createHighlighter } from 'shiki';
import { common, createLowlight } from 'lowlight';
import { getData, handlePromise, RequestMethodType } from "./utils";
import { VimMode } from './extensions/vim';
import { keymap } from '@tiptap/pm/keymap';
import { Selection, TextSelection } from '@tiptap/pm/state';
import { Extension } from '@tiptap/core';

const REPO_NAME = "wenote-repo";

const lowlight = createLowlight(common);

// Initialize shiki highlighter
let highlighter;
createHighlighter({
  theme: 'one-dark-pro',
  langs: ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'rust', 'go', 'html', 'css', 'json', 'markdown', 'yaml', 'bash', 'sql']
}).then(h => {
  highlighter = h;
});

// Custom extension for code blocks
const CustomCodeBlock = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
    };
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: 'plain',
        parseHTML: element => element.getAttribute('language') || 'plain',
        renderHTML: attributes => ({
          language: attributes.language,
          class: 'line-numbers-mode',
        }),
      },
    };
  },
});

async function sendNodeUpdateRequest(note_path, branch_name, commit_id, note_value, onSuccessCallback, onFailureCallback) {
  if(!note_path || !branch_name || !commit_id){
    console.log(`Note Update Prevented: arguments empty note_path:${note_path} branch_name:${branch_name} commit_id:${commit_id}`);
    return;
  }
  console.log(`sendNodeUpdateRequest:note_value: ${note_value}`);

  let api_route = ["update-note"];
  let request_options = {method: RequestMethodType.PUT, mode: "cors",};
  let request_params = { 
    note_path: note_path,
    note_value: note_value,
    commit_id: commit_id,
    branch_name: branch_name,
    repo_name: REPO_NAME,
   };

  let [promise, abortRequest] = getData(api_route, false, request_params, request_options);
  handlePromise(promise, onSuccessCallback, onFailureCallback,"EditorComponent update-note" );

  return abortRequest;
}

function effectGetNote(note_path, branch_name, setNoteText, setCommitId) {
  if(!note_path || !branch_name){
    console.log(`Note Fetch Prevented: arguments empty note_path:${note_path} branch_name:${branch_name}`);
    return;
  }
  console.log(`${note_path} ${branch_name}`);
  let api_route = ["get-note"];
  let request_options = {method: RequestMethodType.GET, mode: "cors",};
  let request_params = { 
    note_path: note_path,
    branch_name: branch_name,
    repo_name: REPO_NAME,
   };

  let [promise, abortRequest] = getData(api_route, true, request_params, request_options);
  handlePromise(promise,
      (response) => { setNoteText(response.body.note); setCommitId(response.body.commit_id);},
      (response) => { setNoteText(`Request failed with: ${JSON.stringify(response.error)}`); },
      "EditorComponent get-note"
  );

  return abortRequest;
}

const MenuBar = ({ editor, isVimMode, setIsVimMode }) => {
  if (!editor) {
    return null;
  }

  const languages = [
    { label: 'Plain', value: 'plain' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'JSON', value: 'json' },
    { label: 'Markdown', value: 'markdown' },
    { label: 'YAML', value: 'yaml' },
    { label: 'Bash', value: 'bash' },
    { label: 'SQL', value: 'sql' },
  ];

  return (
    <div className="editor-menu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'is-active' : ''}
      >
        highlight
      </button>
      <div className="editor-menu-group">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          code block
        </button>
        {editor.isActive('codeBlock') && (
          <select
            value={editor.getAttributes('codeBlock').language || 'plain'}
            onChange={e => {
              editor
                .chain()
                .focus()
                .setCodeBlock({ language: e.target.value })
                .run();
            }}
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        bullet list
      </button>
      <button onClick={() => editor.chain().focus().undo().run()}>
        undo
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        redo
      </button>
      <button
        onClick={() => setIsVimMode(prev => !prev)}
        className={isVimMode ? 'is-active' : ''}
        title="Toggle Vim Mode (Ctrl/Cmd + Alt + V)"
      >
        {isVimMode ? 'Vim: ON' : 'Vim: OFF'}
      </button>
    </div>
  );
};

export default function EditorComponent({note_path, branch_name, commit_id, setBranchNme, setCommitId}) {
  const [noteText, setNoteText] = React.useState("");
  const [isVimMode, setIsVimMode] = React.useState(false);
  const abortRequestRef = React.useRef(null);

  // Define VimKeymap inside the component
  const VimKeymap = React.useMemo(() => {
    return Extension.create({
      name: 'vimKeymap',
      addProseMirrorPlugins() {
        if (!isVimMode) return [];
        
        return [
          keymap({
            'h': (state, dispatch) => {
              if (dispatch) {
                const { from } = state.selection;
                if (from > 0) {
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, from - 1)));
                }
              }
              return true;
            },
            'l': (state, dispatch) => {
              if (dispatch) {
                const { from } = state.selection;
                if (from < state.doc.content.size) {
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, from + 1)));
                }
              }
              return true;
            },
            'j': (state, dispatch) => {
              if (dispatch) {
                const { $from } = state.selection;
                const after = $from.after();
                if (after !== undefined) {
                  dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(after))));
                }
              }
              return true;
            },
            'k': (state, dispatch) => {
              if (dispatch) {
                const { $from } = state.selection;
                const before = $from.before();
                if (before !== undefined) {
                  dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(before))));
                }
              }
              return true;
            },
            'x': (state, dispatch) => {
              if (dispatch) {
                const { from, to } = state.selection;
                dispatch(state.tr.delete(from, to + 1));
              }
              return true;
            },
          })
        ];
      },
    });
  }, [isVimMode]);

  // Add keyboard shortcut for toggling Vim mode
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.altKey && event.code === 'KeyV') {
        event.preventDefault();
        setIsVimMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: {
          HTMLAttributes: {
            class: 'inline-code',
          },
        },
      }),
      Highlight,
      CustomCodeBlock.configure({
        lowlight,
        defaultLanguage: 'plain',
      }),
      VimKeymap,
      Extension.create({
        name: 'codeShortcuts',
        addKeyboardShortcuts() {
          return {
            'Mod-e': () => this.editor.commands.toggleCode(),
          }
        },
      }),
    ],
    content: noteText,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNoteText(html);
    },
  });

  // Effect to fetch note when note_path or branch_name changes
  React.useEffect(() => {
    if (note_path && branch_name) {
      const abortRequest = effectGetNote(note_path, branch_name, text => {
        setNoteText(text);
        editor?.commands.setContent(text);
      }, setCommitId);
      return () => {
        if (typeof abortRequest === 'function') {
          abortRequest();
        }
      };
    }
  }, [note_path, branch_name, setCommitId, editor]);

  // Effect to handle note updates with keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.code === 'KeyS') {
        event.preventDefault();
        if (note_path && branch_name && commit_id && noteText) {
          const abortRequest = sendNodeUpdateRequest(
            note_path, 
            branch_name, 
            commit_id, 
            noteText,
            (response) => { 
              console.log("Note updated successfully"); 
              setCommitId(response.body.commit_id);
            },
            (response) => { console.error("Failed to update note:", response.error); }
          );
          abortRequestRef.current = abortRequest;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (abortRequestRef.current && typeof abortRequestRef.current === 'function') {
        abortRequestRef.current();
      }
    };
  }, [noteText, note_path, branch_name, commit_id, setCommitId]);

  if(!branch_name) {
    return (
      <div className="empty-editor">
        <div className="empty-message">
          <h2>No Branch Selected</h2>
          <p>Please choose a branch to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {note_path ? (
        <>
          <div className="editor-header">
            <div className="file-info">
              <span className="file-path">{note_path}</span>
              <span className="commit-id">Commit: {commit_id?.substring(0, 7) || 'None'}</span>
            </div>
            <MenuBar 
              editor={editor} 
              isVimMode={isVimMode} 
              setIsVimMode={setIsVimMode}
            />
          </div>
          <div className="editor-content">
            {editor && (
              <BubbleMenu 
                className="bubble-menu" 
                tippyOptions={{ duration: 100 }} 
                editor={editor}
                shouldShow={({ editor, view, state, from, to }) => {
                  const isSelection = from !== to;
                  const isCodeBlock = editor.isActive('codeBlock');
                  const isCode = editor.isActive('code');
                  return isSelection && !isCodeBlock && !isCode;
                }}
              >
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'is-active' : ''}
                >
                  bold
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'is-active' : ''}
                >
                  italic
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                  className={editor.isActive('highlight') ? 'is-active' : ''}
                >
                  highlight
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleCode().run();
                  }}
                  className={editor.isActive('code') ? 'is-active' : ''}
                  title="Inline Code (Ctrl/Cmd + E)"
                >
                  code
                </button>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} spellcheck="false" />
            {isVimMode && (
              <div className="vim-mode-indicator">
                VIM
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-editor">
          <div className="empty-message">
            <h2>No File Selected</h2>
            <p>Select a file from the sidebar to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
}