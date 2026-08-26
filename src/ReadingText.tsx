/** Keep a short ending together without fixed line breaks or shrinking the text.
 * The inline block can still wrap internally if enlarged text needs more room. */
export function ReadingText({ children }: { children: string }) {
  const parts = children.match(/^(.*\s)(\S+\s+\S+)$/s);
  return parts ? <>{parts[1]}<span className="reading-phrase">{parts[2]}</span></> : <>{children}</>;
}
