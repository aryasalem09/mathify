import { useEffect, useRef } from "react";
import * as ace from "ace-builds";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";

type AceJavaEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function AceJavaEditor({ value, onChange }: AceJavaEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ace.Ace.Editor | null>(null);
  const lastValueRef = useRef(value);
  const isSyncingRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = ace.edit(containerRef.current);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/java");
    editor.session.setUseWorker(false);
    editor.setValue(value, -1);
    lastValueRef.current = value;

    editor.on("change", () => {
      if (isSyncingRef.current) return;
      const nextValue = editor.getValue();
      lastValueRef.current = nextValue;
      onChangeRef.current(nextValue);
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === lastValueRef.current) return;

    isSyncingRef.current = true;
    editor.setValue(value, -1);
    editor.clearSelection();
    lastValueRef.current = value;
    isSyncingRef.current = false;
  }, [value]);

  return <div ref={containerRef} style={{ height: 300, width: "100%" }} />;
}
