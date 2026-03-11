import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthStore } from '@conduit/auth-data-access';
import { firstValueFrom } from 'rxjs';

const API_BASE = "/conduit-api";

@Component({
  selector: 'conduit-feature-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-settings.html',
  styleUrl: './feature-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSettingsComponent implements OnInit {
  private authStore = inject(AuthStore);
  private router    = inject(Router);
  private http      = inject(HttpClient);

  user = this.authStore.user;

  image    = signal('');
  username = signal('');
  bio      = signal('');
  email    = signal('');
  password = signal('');
  errors   = signal<string[]>([]);
  loading  = signal(false);

  ngOnInit() {
    const currentUser = this.user();
    if (currentUser) {
      this.image.set(currentUser.image || '');
      this.username.set(currentUser.username || '');
      this.bio.set(currentUser.bio || '');
      this.email.set(currentUser.email || '');
    }
  }

  async updateSettings() {
    this.errors.set([]);
    this.loading.set(true);
    const payload: any = {
      email:    this.email(),
      username: this.username(),
      bio:      this.bio(),
      image:    this.image(),
    };
    if (this.password()) payload.password = this.password();

    try {
      const token = this.authStore.token();
      const response: any = await firstValueFrom(
        this.http.put(`${API_BASE}/user`, { user: payload }, {
          headers: token ? { Authorization: `Token ${token}` } : {},
        })
      );
      if (response?.user) {
        this.authStore.setUser(response.user);
        this.router.navigate(['/profile', response.user.username]);
      }
    } catch (error: any) {
      const body = error?.error;
      const msgs: string[] = [];
      if (body?.errors) {
        for (const [field, errs] of Object.entries(body.errors)) {
          for (const msg of errs as string[]) msgs.push(`${field} ${msg}`);
        }
      }
      this.errors.set(msgs.length ? msgs : ['Update failed.']);
    } finally {
      this.loading.set(false);
    }
  }

  logout() {
    this.authStore.clearUser();
    this.router.navigate(['/']);
  }
}
