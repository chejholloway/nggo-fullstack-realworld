import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthStore } from '@conduit/auth-data-access';
import { fromObservable } from '@conduit/shared-data-access';

const API_BASE = '/conduit-api';

interface UserResponse {
  user: { email: string; token: string; username: string; bio: string; image: string };
}

@Component({
  selector: 'conduit-feature-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-settings.html',
  styleUrl: './feature-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSettingsComponent implements OnInit {
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private http = inject(HttpClient);

  image = signal('');
  username = signal('');
  bio = signal('');
  email = signal('');
  password = signal('');
  errors = signal<string[]>([]);
  loading = signal(false);

  ngOnInit() {
    const u = this.authStore.user();
    if (u) {
      this.image.set(u.image || '');
      this.username.set(u.username || '');
      this.bio.set(u.bio || '');
      this.email.set(u.email || '');
    }
  }

  set(field: 'image' | 'username' | 'bio' | 'email' | 'password', event: Event) {
    this[field].set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  async updateSettings() {
    this.errors.set([]);
    this.loading.set(true);

    const payload: Record<string, string> = {
      email: this.email(),
      username: this.username(),
      bio: this.bio(),
      image: this.image(),
    };
    if (this.password()) payload['password'] = this.password();

    const token = this.authStore.token();
    const headers = token
      ? new HttpHeaders({ Authorization: `Token ${token}` })
      : new HttpHeaders();

    const result = await fromObservable(
      this.http.put<UserResponse>(`${API_BASE}/user`, { user: payload }, { headers }),
    );

    result.match(
      (response) => {
        this.authStore.setUser(response.user);
        this.router.navigate(['/profile', response.user.username]);
      },
      (error) => {
        const msgs = Object.entries(error.fields).flatMap(([f, ms]) => ms.map((m) => `${f} ${m}`));
        this.errors.set(msgs.length ? msgs : [error.message || 'Update failed.']);
      },
    );

    this.loading.set(false);
  }

  logout() {
    this.authStore.clearUser();
    this.router.navigate(['/']);
  }
}
