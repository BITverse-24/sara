export function renderMarkdown(text: string): { __html: string } {
  if (!text) return { __html: '' };
  
  // Split into lines for list processing
  const lines = text.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let isNumbered = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const bulletMatch = line.match(/^- (.*)$/);
    const numberedMatch = line.match(/^(\d+)\. (.*)$/);

    if (bulletMatch || numberedMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
        isNumbered = !!numberedMatch;
      }
      const content = bulletMatch ? bulletMatch[1] : numberedMatch![2];
      listItems.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        const listTag = isNumbered ? 'ol' : 'ul';
        processedLines.push(`<${listTag} class="list-inside my-2 ${isNumbered ? 'list-decimal' : 'list-disc'}">${listItems.join('')}</${listTag}>`);
        listItems = [];
        inList = false;
      }
      if (line.trim()) {
        processedLines.push(line);
      } else {
        processedLines.push('');
      }
    }
  }

  if (inList && listItems.length > 0) {
    const listTag = isNumbered ? 'ol' : 'ul';
    processedLines.push(`<${listTag} class="list-inside my-2 ${isNumbered ? 'list-decimal' : 'list-disc'}">${listItems.join('')}</${listTag}>`);
  }

  let html = processedLines.join('\n');
  
  // Apply markdown formatting
  html = html
    // Code blocks first (before inline code)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-700 p-2 rounded my-2 overflow-x-auto"><code class="text-sm">$1</code></pre>')
    // Bold (must come before italic to avoid conflicts)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic (single asterisk, not double)
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Underline HTML tags
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return { __html: html };
}

