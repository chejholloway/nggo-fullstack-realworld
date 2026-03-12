import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '@conduit/auth-data-access';
import { fromObservable } from '@conduit/shared-data-access';

const API_BASE = '/conduit-api';

interface LoginResponse {
  user: { email: string; token: string; username: string; bio: string; image: string };
}

@Component({
  selector: 'app-feature-login',
  imports: [RouterLink],
  templateUrl: './feature-login.html',
  styleUrl: './feature-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureLogin {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errors = signal<string[]>([]);
  protected readonly loading = signal(false);

  protected async onSubmit() {
    this.errors.set([]);
    this.loading.set(true);

    const result = await fromObservable(
      this.http.post<LoginResponse>(`${API_BASE}/users/login`, {
        user: { email: this.email(), password: this.password() },
      }),
    );

    result.match(
      (response) => {
        this.authStore.setUser(response.user);
        this.router.navigate(['/']);
      },
      (error) => {
        const msgs = Object.entries(error.fields).flatMap(([f, ms]) => ms.map((m) => `${f} ${m}`));
        this.errors.set(
          msgs.length ? msgs : [error.message || 'Login failed. Please check your credentials.'],
        );
      },
    );

    this.loading.set(false);
  }
}
