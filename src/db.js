// src/db.js
import localforage from 'localforage';

export const store = localforage.createInstance({
  name: 'sentiment-cam',
  storeName: 'photos'
});

// Guarda un registro { id, timestamp, label, score, imageDataURL }
export async function saveRecord(rec) {
  return store.setItem(rec.id, rec);
}

// Devuelve todos ordenados por timestamp DESC (anti-cronológico)
export async function listRecordsDesc() {
  const items = [];
  await store.iterate((value) => items.push(value));
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

// Borra todo (opcional)
export async function clearAll() {
  await store.clear();
}
