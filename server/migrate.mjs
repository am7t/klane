import {readFile} from 'node:fs/promises';
import {database,closeDatabase} from './integrations/tiger.mjs';
await database().query(await readFile(new URL('./sql/tiger.sql',import.meta.url),'utf8'));
await closeDatabase();console.log('Tiger Cloud schema ready.');
