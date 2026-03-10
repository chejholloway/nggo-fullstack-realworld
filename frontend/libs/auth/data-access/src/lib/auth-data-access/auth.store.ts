import { Injectable, signal, computed } from '@angular/core';
import { z } from 'zod';

const UserSchema = z.object({
  email:    z.string().email(),
  token:    z.string(),
  username: z.string(),
  bio:      z.string().optional(),
  image:    z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

const USER_KEY = 'conduit_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user = signal<User | null>(this.loadUser());

  user       = this._user.asReadonly();
  token      = computed(() => this._user()?.token ?? null);
  isLoggedIn = computed(() => this._user() !== null);
  username   = computed(() => this._user()?.username ?? '');
  image      = computed(() => this._user()?.image ?? '');

  setUser(raw: unknown): void {
    const user = UserSchema.parse(raw);
    this._user.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    this._user.set(null);
    localStorage.removeItem(USER_KEY);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const result = UserSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }
}