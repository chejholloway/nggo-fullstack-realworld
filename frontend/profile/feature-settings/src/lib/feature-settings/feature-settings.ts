import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@conduit/auth-data-access';
import { User, UpdateUserRequest } from '@conduit/gen/auth';
import { Router } from '@angular/router';
import { createClient } from "@connectrpc/connect";
import { AuthService } from "@conduit/gen/auth";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";
import { from, Observable } from "rxjs";

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
  private router = inject(Router);
  private transport = inject(CONNECT_TRANSPORT);
  private client = createClient(AuthService, this.transport);

  user = this.authStore.user;

  image = signal('');
  username = signal('');
  bio = signal('');
  email = signal('');
  password = signal('');

  ngOnInit() {
    const currentUser = this.user();
    if (currentUser) {
      this.image.set(currentUser.image || '');
      this.username.set(currentUser.username || '');
      this.bio.set(currentUser.bio || '');
      this.email.set(currentUser.email || '');
    }
  }

  updateSettings() {
    const request = {
      email: this.email(),
      username: this.username(),
      bio: this.bio(),
      image: this.image(),
    } as UpdateUserRequest;

    if (this.password()) {
      request.password = this.password();
    }

    from(this.client.updateUser(request)).subscribe({
      next: (res) => {
        this.authStore.setUser(res.user);
        this.router.navigate(['/profile', res.user?.username]);
      },
      error: (err) => console.error(err),
    });
  }

  logout() {
    this.authStore.clearUser();
    this.router.navigate(['/']);
  }
}

