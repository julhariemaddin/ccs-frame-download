/**
 * parseList.js
 * ------------------------------------------------------------------
 * list.txt format (one entry per line):
 *
 *   PROGRAM
 *   BACHELOR OF SCIENCE IN COMPUTER SCIENCE - BSCS
 *   BACHELOR OF SCIENCE IN INFORMATION SYSTEM - BSIS
 *
 * Every non-empty line is its OWN entry. The only line that is ever
 * skipped is a first line that is purely a category label (PROGRAM /
 * EVENT / EVENTS) with no " - " separator — that's a header, not data.
 * Handles \n and \r\n line endings and a missing trailing newline.
 * ------------------------------------------------------------------
 */
export function parseList(raw) {
  const lines = raw
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines
    .filter((line) => {
      const isHeaderLike = /^(PROGRAM|EVENT|EVENTS)$/i.test(line) && !line.includes(' - ');
      return !isHeaderLike;
    })
    .map((line) => {
      if (line.includes(' - ')) {
        const parts = line.split(' - ');
        const code = parts.pop().trim();
        const full = parts.join(' - ').trim();
        return { full, code };
      }
      return { full: line, code: line };
    });
}

export async function loadList(listFile) {
  const res = await fetch(listFile);
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${listFile}`);
  const raw = await res.text();
  return parseList(raw);
}
