import { openDB } from 'idb';

const dbName = 'flightDB';
const storeName = 'flightRecords';

const dbPromise = openDB(dbName, 1, {
  upgrade(db) {
    db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
  },
});

export const saveFlightRecord = async (
  flightNumber: string,
  flightType: string,
  flightName: string,
  coachNumber: string
) => {
  const db = await dbPromise;
  return db.add(storeName, {
    flightNumber,
    flightType,
    flightName,
    coachNumber,
    createdAt: new Date().toISOString(),
  });
};

export const getFlightRecords = async () => {
  const db = await dbPromise;
  return db.getAll(storeName);
};