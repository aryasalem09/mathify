import type { ReactNode } from "react";
import "../lab.css";

type CodeBlockProps = {
  code: string;
  label?: string;
  className?: string;
};

const KEYWORDS = new Set([
  "class",
  "public",
  "static",
  "void",
  "int",
  "double",
  "float",
  "long",
  "short",
  "byte",
  "boolean",
  "char",
  "String",
  "new",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "import",
  "package",
  "private",
  "protected",
  "final",
  "this",
  "null",
  "true",
  "false",
  "extends",
  "implements",
  "throws",
  "throw",
  "try",
  "catch",
  "finally",
  "Scanner",
  "System",
  "out",
  "println",
  "printf",
]);

const TOKEN_REGEX =
  /(\"(?:\\.|[^"\\])*\"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

function getTokenClass(token: string) {
  if (token.startsWith("//") || token.startsWith("/*")) {
    return "token-comment";
  }
  if (token.startsWith('"') || token.startsWith("'")) {
    return "token-string";
  }
  if (/^\d/.test(token)) {
    return "token-number";
  }
  if (KEYWORDS.has(token)) {
    return "token-keyword";
  }
  return "token-plain";
}

function highlightJava(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(code.slice(lastIndex, index));
    }
    const token = match[0];
    const tokenClass = getTokenClass(token);
    nodes.push(
      <span key={`${index}-${token}`} className={tokenClass}>
        {token}
      </span>
    );
    lastIndex = index + token.length;
  }

  if (lastIndex < code.length) {
    nodes.push(code.slice(lastIndex));
  }

  return nodes;
}

export default function CodeBlock({ code, label, className }: CodeBlockProps) {
  return (
    <div className={`lab-code-block ${className ?? ""}`.trim()}>
      {label ? <div className="lab-code-label">{label}</div> : null}
      <pre className="lab-code-pre">
        <code>{highlightJava(code)}</code>
      </pre>
    </div>
  );
}
