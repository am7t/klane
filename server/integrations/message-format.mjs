// Presentation only: retain original evidence in storage, avoid internal IDs in SMS.
export function formatFieldReply(input){
 return String(input)
  .replace(/^\s*(?:signals?|evidence ids?|source ids?)\s*:\s*.*(?:signal-|live-|\b[a-f0-9]{16,}\b).*$/gim,'')
  .replace(/\[(?:[^\]\n]*\b(?:signal-|live-)[^\]\n]*)\]/g,'')
  .replace(/\b(?:signal|live)-[a-z0-9-]+\b/gi,'')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'$1: $2')
  .replace(/\*\*([^*]+)\*\*/g,'$1').replace(/__([^_]+)__/g,'$1')
  .replace(/[*`]/g,'').replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm,'')
  .replace(/^[ \t]*[-+][ \t]+/gm,'• ')
  .replace(/^\s*\|?\s*:?-{3,}.*\|.*$/gm,'').replace(/\s*\|\s*/g,' — ')
  .replace(/^\s*(?:\[\s*\]|\(\s*\)|[,;—-])?\s*unverified\s*[.)]?\s*$/gim,'')
  .replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
