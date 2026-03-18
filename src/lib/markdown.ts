// Simple markdown parser for rich text formatting
export function parseMarkdown(text: string): string {
  if (!text) return '';
  
  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough: ~~text~~
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Underline: __text__
    .replace(/__(.+?)__/g, '<u>$1</u>')
    // Code: `text`
    .replace(/`(.+?)`/g, '<code class="bg-secondary px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Line breaks
    .replace(/\n/g, '<br />');
  
  return html;
}

// Preview markdown in real-time (for editor)
export function previewMarkdown(text: string): string {
  return parseMarkdown(text);
}

// Toolbar actions for the editor
export const markdownActions = {
  bold: (text: string, selectionStart: number, selectionEnd: number) => {
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);
    return {
      text: `${before}**${selected || 'bold text'}**${after}`,
      cursorPos: selectionEnd + 4 + (selected ? 0 : 10),
    };
  },
  
  italic: (text: string, selectionStart: number, selectionEnd: number) => {
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);
    return {
      text: `${before}*${selected || 'italic text'}*${after}`,
      cursorPos: selectionEnd + 2 + (selected ? 0 : 12),
    };
  },
  
  underline: (text: string, selectionStart: number, selectionEnd: number) => {
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);
    return {
      text: `${before}__${selected || 'underlined text'}__${after}`,
      cursorPos: selectionEnd + 4 + (selected ? 0 : 16),
    };
  },
  
  strikethrough: (text: string, selectionStart: number, selectionEnd: number) => {
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);
    return {
      text: `${before}~~${selected || 'strikethrough text'}~~${after}`,
      cursorPos: selectionEnd + 4 + (selected ? 0 : 19),
    };
  },
  
  code: (text: string, selectionStart: number, selectionEnd: number) => {
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);
    return {
      text: `${before}\`${selected || 'code'}\`${after}`,
      cursorPos: selectionEnd + 2 + (selected ? 0 : 6),
    };
  },
};
