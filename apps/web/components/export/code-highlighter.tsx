"use client";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlight(code: string, language: "tsx" | "html" | "css" | "json"): string {
  let html = escapeHtml(code);

  html = html.replace(/(\/\/.*$)/gm, '<span class="text-[var(--text-muted)]">$1</span>');
  html = html.replace(/(&quot;[^&]*&quot;|'[^']*')/g, '<span class="text-[var(--color-tertiary)]">$1</span>');
  html = html.replace(/\b(import|from|export|default|return|const|function|class|extends|if|else)\b/g, '<span class="text-[var(--color-primary)]">$1</span>');
  html = html.replace(/\b(display|padding|margin|background|color|border|font-size|font-weight|line-height|opacity|box-shadow)\b/g, '<span class="text-[#c9e7f7]">$1</span>');

  if (language === "html" || language === "tsx") {
    html = html.replace(/(&lt;\/?)([A-Za-z0-9._-]+)/g, '$1<span class="text-[var(--color-primary)]">$2</span>');
  }

  return html;
}

export function CodeHighlighter({
  code,
  language
}: {
  code: string;
  language: "tsx" | "html" | "css" | "json";
}): React.ReactElement {
  return (
    <pre className="scrollbar-thin overflow-auto bg-[#050607] px-5 py-4 text-sm leading-7 text-[var(--text-primary)]">
      {code.split("\n").map((line, index) => (
        <div key={`${index}-${line}`} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 font-mono text-[13px]">
          <span className="select-none text-right text-[var(--text-muted)]">{index + 1}</span>
          <code dangerouslySetInnerHTML={{ __html: highlight(line, language) || " " }} />
        </div>
      ))}
    </pre>
  );
}
