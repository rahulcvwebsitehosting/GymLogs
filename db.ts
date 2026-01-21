
export type PhotoAngle = 'front' | 'side' | 'back' | 'other';

export interface ProgressPhoto {
  id: string;
  timestamp: number;
  blob: Blob;
  angle: PhotoAngle;
  label?: string;
}

const DB_NAME = 'IronLogDB';
const DB_VERSION = 2; // Incremented version
const STORE_NAME = 'progress_photos';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePhoto = async (photo: Omit<ProgressPhoto, 'id'>): Promise<string> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({ ...photo, id });

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

export const getAllPhotos = async (): Promise<ProgressPhoto[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const photos = request.result as ProgressPhoto[];
      resolve(photos.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deletePhoto = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
