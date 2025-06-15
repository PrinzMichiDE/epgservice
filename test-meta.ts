import { setLastUpdate, getLastUpdate, initTables } from './src/services/dbService';

(async () => {
  await initTables();
  await setLastUpdate(Date.now());
  const last = await getLastUpdate();
  console.log('Test: lastUpdate in meta:', last);
})();