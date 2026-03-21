import { Injectable, inject, signal } from '@angular/core';
import {
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged, User, sendPasswordResetEmail,
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private fb = inject(FirebaseService);

  currentUser = signal<User | null>(null);
  isLoading = signal(true);

  constructor() {
    if (this.fb.isBrowser) {
      onAuthStateChanged(this.fb.auth, user => {
        this.currentUser.set(user);
        this.isLoading.set(false);
      });
    } else {
      this.isLoading.set(false);
    }
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.fb.auth, email, password);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.fb.auth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.fb.auth);
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
