import {statement,syncWarehouse} from './integrations/snowflake.mjs';
import {readFile} from 'node:fs/promises';
import {closeDatabase} from './integrations/tiger.mjs';
if(process.argv.includes('--schema')){for(const sql of (await readFile(new URL('./sql/snowflake.sql',import.meta.url),'utf8')).split(';').filter(s=>s.includes('CREATE TABLE')))await statement(sql);console.log('Snowflake schema ready.')}else console.log(await syncWarehouse());await closeDatabase();
