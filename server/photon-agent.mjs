import {listen,closePhoton} from './integrations/photon.mjs';
import {closeDatabase} from './integrations/tiger.mjs';
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await closePhoton();await closeDatabase();process.exit(0)});
await listen();
