import {it,expect} from 'vitest';
import {formatFieldReply} from './integrations/message-format.mjs';
it('renders readable plain text and suppresses internal citation footers',()=>{const text='**Best lead**\n\n- Example facility [signal-abcdef1234567890]\n\nSignals: signal-abcdef1234567890 — unverified';expect(formatFieldReply(text)).toBe('Best lead\n\n• Example facility')});
it('preserves meaningful uncertainty and public source links',()=>{expect(formatFieldReply('## Next step\nBuying intent is unverified.\n[Company news](https://example.com/news)')).toBe('Next step\nBuying intent is unverified.\nCompany news: https://example.com/news')});
