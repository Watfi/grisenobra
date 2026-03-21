import { Injectable, inject } from '@angular/core';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, Timestamp,
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private fb = inject(FirebaseService);

  async getAll(): Promise<Project[]> {
    const snap = await getDocs(collection(this.fb.firestore, 'projects'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
  }

  async getFeatured(): Promise<Project[]> {
    const q = query(
      collection(this.fb.firestore, 'projects'),
      where('featured', '==', true),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
  }

  async getById(id: string): Promise<Project | null> {
    const snap = await getDoc(doc(this.fb.firestore, 'projects', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Project;
  }

  async create(project: Omit<Project, 'id'>): Promise<string> {
    const ref = await addDoc(collection(this.fb.firestore, 'projects'), {
      ...project,
      createdAt: Timestamp.now(),
    });
    return ref.id;
  }

  async update(id: string, data: Partial<Project>): Promise<void> {
    await updateDoc(doc(this.fb.firestore, 'projects', id), data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.fb.firestore, 'projects', id));
  }
}
