import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private platformId = inject(PLATFORM_ID);
  private app: FirebaseApp | null = null;
  private _firestore: Firestore | null = null;
  private _auth: Auth | null = null;
  private _storage: FirebaseStorage | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.app = getApps().length ? getApps()[0] : initializeApp(environment.firebaseConfig);
      this._firestore = getFirestore(this.app, 'grisenobra');
      this._auth = getAuth(this.app);
      this._storage = getStorage(this.app);
    }
  }

  get firestore(): Firestore {
    if (!this._firestore) throw new Error('Firestore not available on server');
    return this._firestore;
  }

  get auth(): Auth {
    if (!this._auth) throw new Error('Auth not available on server');
    return this._auth;
  }

  get storage(): FirebaseStorage {
    if (!this._storage) throw new Error('Storage not available on server');
    return this._storage;
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
