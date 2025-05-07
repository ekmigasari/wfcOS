"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  Component,
  ReactElement,
  useState,
} from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { EditorState, LexicalEditor } from "lexical";
import { playSound } from "@/infrastructure/lib/utils";

import {
  notesAtom,
  activeNoteIdAtom,
  createNewNote,
  saveActiveNoteAtom,
  activeNoteContentAtom,
} from "@/application/atoms/notepadAtom";
import { NoteListSidebar } from "./components/NoteListSidebar";
import { RichTextToolbar } from "./components/RichTextToolbar";
import { useDebouncedCallback } from "use-debounce";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const editorTheme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
    h6: "editor-heading-h6",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listitem",
  },
  image: "editor-image",
  link: "editor-link",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
    code: "editor-text-code",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
  },
};

const editorNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
];

function onError(error: Error) {
  console.error(error);
}

// Define the custom Error Boundary Class Component
class EditorErrorBoundary extends Component<
  { children: ReactElement; onError: (error: Error) => void },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError(error);
    console.error("Uncaught error in editor:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.error) {
      // Basic fallback UI
      return <div>Editor Error! Please check console.</div>;
    }
    return this.props.children;
  }
}

const Notepad: React.FC = () => {
  const notes = useAtomValue(notesAtom);
  const [activeNoteId, setActiveNoteId] = useAtom(activeNoteIdAtom);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const setNotes = useSetAtom(notesAtom);
  const saveNote = useSetAtom(saveActiveNoteAtom);
  const activeNoteContent = useAtomValue(activeNoteContentAtom);

  const isMounted = useRef<boolean>(false);
  const currentActiveNoteId = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    currentActiveNoteId.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    if (notes.length === 0 && isMounted.current) {
      console.log("No notes found, creating initial note.");
      createNewNote(setNotes, setActiveNoteId);
    } else if (!activeNoteId && notes.length > 0 && isMounted.current) {
      console.log("No active note ID, selecting first note.");
      setActiveNoteId(notes[0].id);
    } else if (
      activeNoteId &&
      !notes.some((n) => n.id === activeNoteId) &&
      notes.length > 0 &&
      isMounted.current
    ) {
      console.warn(
        "Active note ID not found in notes list, selecting first note."
      );
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId, setActiveNoteId, setNotes]);

  const debouncedSave = useDebouncedCallback(
    (
      noteIdToSave: string | null,
      newEditorState: EditorState,
      editor: LexicalEditor
    ) => {
      if (!noteIdToSave || !isMounted.current) return;

      const stateString = JSON.stringify(newEditorState.toJSON());

      const noteAtChangeTime = notes.find((n) => n.id === noteIdToSave);
      const contentAtChangeTime = noteAtChangeTime?.content;

      if (stateString === contentAtChangeTime) {
        // console.log(`Note ${noteIdToSave}: Content hasn't changed, skipping save.`); // Optional: uncomment for debugging
        return;
      }

      console.log("Saving note:", noteIdToSave);
      saveNote({ noteId: noteIdToSave, content: stateString, editor });
    },
    1000
  );

  const handleOnChange = useCallback(
    (newEditorState: EditorState, editor: LexicalEditor) => {
      const capturedNoteId = currentActiveNoteId.current;
      debouncedSave(capturedNoteId, newEditorState, editor);
    },
    [debouncedSave]
  );

  const initialConfig = {
    namespace: `Notepad-${activeNoteId || "new"}`,
    theme: editorTheme,
    onError,
    nodes: editorNodes,
    editorState: activeNoteId ? activeNoteContent : null,
  };

  const composerKey = activeNoteId || "__EMPTY__";

  const toggleSidebar = useCallback(() => {
    playSound("/sounds/click.mp3");
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="w-full h-full flex relative border border-gray-300 rounded shadow overflow-hidden">
      {isSidebarOpen && <NoteListSidebar />}

      {/* Toggle button as a vertical divider */}
      <div
        onClick={toggleSidebar}
        className={`
          group flex flex-col items-center justify-center h-full w-5 
          border-l border-r border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer
          transition-colors duration-200 select-none
        `}
        title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        <div className="flex flex-col h-16 justify-center items-center">
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </div>

      <div className="flex-grow flex flex-col h-full">
        {activeNoteId ? (
          <LexicalComposer initialConfig={initialConfig} key={composerKey}>
            <RichTextToolbar />
            <div className="flex-grow relative bg-white overflow-y-auto">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="w-full h-full min-h-[200px] p-4 outline-none resize-none editor-content-editable block" />
                }
                placeholder={
                  <div className="editor-placeholder absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
                    Start typing...
                  </div>
                }
                ErrorBoundary={EditorErrorBoundary}
              />
              <OnChangePlugin
                onChange={handleOnChange}
                ignoreHistoryMergeTagChange={true}
              />
              <HistoryPlugin />
              <ListPlugin />
            </div>

            <style jsx global>{`
              .editor-placeholder {
                /* Styles moved to inline style below ContentEditable */
              }
              .editor-content-editable {
                caret-color: black;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                  Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
                  "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 16px;
                line-height: 1.6;
              }
              .editor-paragraph {
                margin-bottom: 8px;
              }
              .editor-list-ul {
                padding-inline-start: 25px;
                margin-block-start: 8px;
                margin-block-end: 8px;
                list-style-type: disc;
              }
              .editor-list-ol {
                padding-inline-start: 25px;
                margin-block-start: 8px;
                margin-block-end: 8px;
                list-style-type: decimal;
              }
              .editor-listitem {
                margin-left: 16px;
                margin-bottom: 4px;
              }
              .editor-nested-listitem {
                list-style-type: circle;
              }
              .editor-content-editable ul,
              .editor-content-editable ol {
                margin: 0;
                padding: 0;
                margin-block-start: 8px;
                margin-block-end: 8px;
                padding-inline-start: 25px;
              }
              .editor-text-bold {
                font-weight: bold;
              }
              .editor-text-italic {
                font-style: italic;
              }
              .editor-text-underline {
                text-decoration: underline;
              }
              .editor-text-strikethrough {
                text-decoration: line-through;
              }
              .editor-text-underlineStrikethrough {
                text-decoration: underline line-through;
              }
              .editor-link {
                color: #007bff;
                text-decoration: underline;
                cursor: pointer;
              }
              .editor-heading-h1 {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 0.5em;
                margin-top: 0.5em;
              }
              .editor-heading-h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 0.5em;
                margin-top: 0.5em;
              }
              .editor-heading-h3 {
                font-size: 1.17em;
                font-weight: bold;
                margin-bottom: 0.5em;
                margin-top: 0.5em;
              }
              .editor-quote {
                margin: 0 0 8px 20px;
                padding-left: 10px;
                border-left: 4px solid #ccc;
                color: #555;
              }
              .editor-code {
                background-color: #f0f0f0;
                font-family: monospace;
                padding: 8px;
                border-radius: 4px;
                margin-bottom: 8px;
                overflow-x: auto;
              }
              .editor-text-code {
                background-color: #f0f0f0;
                font-family: monospace;
                padding: 0.1em 0.3em;
                border-radius: 3px;
              }
            `}</style>
          </LexicalComposer>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500 bg-gray-50">
            {notes.length > 0 ? (
              <p>Loading note...</p>
            ) : (
              <p>Create a new note to start editing.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;
