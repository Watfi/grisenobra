import { Injectable, inject } from '@angular/core';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private fb = inject(FirebaseService);

  async upload(file: File, folder: string): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(this.fb.storage, `${folder}/${fileName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async delete(url: string): Promise<void> {
    try {
      const storageRef = ref(this.fb.storage, url);
      await deleteObject(storageRef);
    } catch {
      // File may not exist, ignore
    }
  }
}
