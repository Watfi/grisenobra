import { Injectable, inject } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../models/site-content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private fb = inject(FirebaseService);
  private readonly docPath = 'site_content/main';

  async get(): Promise<SiteContent> {
    try {
      const snap = await getDoc(doc(this.fb.firestore, this.docPath));
      if (snap.exists()) return snap.data() as SiteContent;
    } catch {
      // SSR or Firebase not configured — return defaults
    }
    return DEFAULT_SITE_CONTENT;
  }

  async save(content: SiteContent): Promise<void> {
    await setDoc(doc(this.fb.firestore, this.docPath), content);
  }
}
