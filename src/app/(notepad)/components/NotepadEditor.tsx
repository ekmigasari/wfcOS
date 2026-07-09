"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { useAtomValue, useSetAtom } from "jotai";
import { EditorState, LexicalEditor } from "lexical";
import React, {
  Component,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  activeNoteContentAtom,
  notesAtom,
  saveActiveNoteAtom,
} from "@/application/atoms/notepadAtom";
import { RichTextToolbar } from "./RichTextToolbar";

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
      return <div>Editor Error! Please check console.</div>;
    }
    return this.props.children;
  }
}

export function NotepadEditor({ activeNoteId }: { activeNoteId: string }) {
  const notes = useAtomValue(notesAtom);
  const saveNote = useSetAtom(saveActiveNoteAtom);
  const activeNoteContent = useAtomValue(activeNoteContentAtom);
  const isMounted = useRef(false);
  const currentActiveNoteId = useRef<string | null>(activeNoteId);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    currentActiveNoteId.current = activeNoteId;
  }, [activeNoteId]);

  const debouncedSave = useDebouncedCallback(
    (
      noteIdToSave: string | null,
      newEditorState: EditorState,
      editor: LexicalEditor
    ) => {
      if (!noteIdToSave || !isMounted.current) return;

      const stateString = JSON.stringify(newEditorState.toJSON());
      const noteAtChangeTime = notes.find((note) => note.id === noteIdToSave);

      if (stateString === noteAtChangeTime?.content) {
        return;
      }

      saveNote({ noteId: noteIdToSave, content: stateString, editor });
    },
    1000
  );

  const handleOnChange = useCallback(
    (newEditorState: EditorState, editor: LexicalEditor) => {
      debouncedSave(currentActiveNoteId.current, newEditorState, editor);
    },
    [debouncedSave]
  );

  const initialConfig = {
    namespace: `Notepad-${activeNoteId}`,
    theme: editorTheme,
    onError,
    nodes: editorNodes,
    editorState: activeNoteContent,
  };

  return (
    <LexicalComposer initialConfig={initialConfig} key={activeNoteId}>
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
        .editor-content-editable {
          caret-color: black;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol";
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
  );
}
