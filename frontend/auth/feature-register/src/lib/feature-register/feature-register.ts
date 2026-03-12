import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '@conduit/auth-data-access';
import { fromObservable } from '@conduit/shared-data-access';

const API_BASE = '/conduit-api';

interface RegisterResponse {
  user: { email: string; token: string; username: string; bio: string; image: string };
}

@Component({
  selector: 'app-feature-register',
  imports: [RouterLink],
  templateUrl: './feature-register.html',
  styleUrl: './feature-register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureRegister {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly username = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errors = signal<string[]>([]);
  protected readonly loading = signal(false);

  protected async onSubmit() {
    this.errors.set([]);
    this.loading.set(true);

    const result = await fromObservable(
      this.http.post<RegisterResponse>(`${API_BASE}/users`, {
        user: { username: this.username(), email: this.email(), password: this.password() },
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
          msgs.length ? msgs : [error.message || 'Registration failed. Please try again.'],
        );
      },
    );

    this.loading.set(false);
  }
}
