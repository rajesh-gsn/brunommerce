import { useEffect } from 'react';
import { findTimestamps, formatChip } from 'utils/response/timestamps';

const MAX_CHIPS = 300;

const createChip = (date) => {
  const chip = document.createElement('span');
  chip.className = 'timestamp-chip';
  chip.textContent = formatChip(date);
  chip.title = `${date.toISOString()} (UTC)`;
  return chip;
};

// Adds a chip with the local time after each timestamp. The chips are CodeMirror bookmarks, so they sit beside the
// text without being part of it: the document, selection and copy keep the original response.
const addChips = (editor) => {
  const bookmarks = [];

  editor.operation(() => {
    editor.eachLine((line) => {
      if (bookmarks.length >= MAX_CHIPS || !line.text.includes('T')) return;

      const lineNumber = editor.getLineNumber(line);
      const timestamps = findTimestamps(line.text);

      timestamps.forEach(({ index, length, date }) => {
        if (bookmarks.length >= MAX_CHIPS) return;

        // A line with one timestamp (pretty-printed JSON) gets its chip at the end of the line, like a note in the
        // margin; with several (minified JSON, XML) each chip follows its own timestamp, after the closing quote
        const afterTimestamp = index + length + (line.text[index + length] === '"' ? 1 : 0);
        const ch = timestamps.length === 1 ? line.text.length : afterTimestamp;
        bookmarks.push(editor.setBookmark({ line: lineNumber, ch }, { widget: createChip(date), insertLeft: true }));
      });
    });
  });

  return bookmarks;
};

/**
 * Shows local-time chips after the timestamps in a CodeMirror response editor.
 *
 * @param {{ current: { editor: object } | null }} editorRef - ref to the CodeEditor
 * @param {{ enabled: boolean, value: string }} options - `value` is the displayed text, so the chips follow it
 */
export const useTimestampChips = (editorRef, { enabled, value }) => {
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!enabled || !editor) return;

    const bookmarks = addChips(editor);
    return () => bookmarks.forEach((bookmark) => bookmark.clear());
  }, [editorRef, enabled, value]);
};
