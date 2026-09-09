const DATABASE_NAME = "prompt-pocket-assets";
const DATABASE_VERSION = 1;
const IMAGE_STORE = "images";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(IMAGE_STORE)) {
        database.createObjectStore(IMAGE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开本地图片库"));
  });
}

export async function getLocalImage(id: string) {
  const database = await openDatabase();
  return new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE, "readonly");
    const request = transaction.objectStore(IMAGE_STORE).get(id);

    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : undefined);
    request.onerror = () => reject(request.error ?? new Error("无法读取本地图片"));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

export async function putLocalImage(id: string, image: Blob) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE, "readwrite");
    transaction.objectStore(IMAGE_STORE).put(image, id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("无法保存本地图片"));
    };
  });
}

export async function deleteLocalImage(id: string) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE, "readwrite");
    transaction.objectStore(IMAGE_STORE).delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("无法删除本地图片"));
    };
  });
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("无法导出本地图片"));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string) {
  if (!dataUrl.startsWith("data:image/")) throw new Error("不是有效的图片数据");
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error("无法读取备份中的图片");
  return response.blob();
}
