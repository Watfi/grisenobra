import { Injectable, inject } from '@angular/core';
import {
  collection, addDoc, getDocs, doc, updateDoc,
  orderBy, query, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { ContactSubmission } from '../models/contact-submission.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private firebase = inject(FirebaseService);

  private toDate(val: unknown): Date {
    if (val instanceof Timestamp) return val.toDate();
    if (val instanceof Date) return val;
    return new Date();
  }

  async submit(data: Pick<ContactSubmission, 'name' | 'email' | 'message'>): Promise<void> {
    const col = collection(this.firebase.firestore, 'contacts');
    await addDoc(col, {
      ...data,
      status: 'abierto',
      createdAt: serverTimestamp(),
    });
  }

  async getAll(): Promise<ContactSubmission[]> {
    const col = collection(this.firebase.firestore, 'contacts');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<ContactSubmission, 'id' | 'createdAt' | 'repliedAt'>),
      createdAt: this.toDate(d.data()['createdAt']),
      repliedAt: d.data()['repliedAt'] ? this.toDate(d.data()['repliedAt']) : undefined,
    }));
  }

  async markReplied(id: string, reply: string): Promise<void> {
    const ref = doc(this.firebase.firestore, 'contacts', id);
    await updateDoc(ref, {
      status: 'cerrado',
      reply,
      repliedAt: serverTimestamp(),
    });
  }

  async reopen(id: string): Promise<void> {
    const ref = doc(this.firebase.firestore, 'contacts', id);
    await updateDoc(ref, { status: 'abierto' });
  }
}
