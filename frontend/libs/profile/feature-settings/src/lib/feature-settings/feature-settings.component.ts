import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@conduit/auth-data-access';
import { AuthStore } from '@conduit/auth-data-access';
import { UpdateUserRequest } from '@conduit/gen/auth/v1/auth_pb';

@Component({
  selector: 'app-feature-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feature-settings.component.html',
  styleUrl: './feature-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSettingsComponent implements OnInit {
  private userService = inject(UserService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  user = signal(this.authStore.user());
  
  // Form fields
  imageUrl = signal<string>('');
  username = signal<string>('');
  bio = signal<string>('');
  email = signal<string>('');
  newPassword = signal<string>('');
  password = signal<string>('');

  loading = signal(false);
  errors = signal<string[]>([]);

  ngOnInit() {
    const currentUser = this.authStore.user();
    if (currentUser) {
      this.imageUrl.set(currentUser.image || '');
      this.username.set(currentUser.username);
      this.bio.set(currentUser.bio || '');
      this.email.set(currentUser.email);
    }
  }

  updateSettings() {
    this.loading.set(true);
    this.errors.set([]);

    const currentUser = this.authStore.user();
    if (!currentUser) return;

    const request = new UpdateUserRequest({
      user: {
        email: this.email() || currentUser.email,
        username: this.username() || currentUser.username,
        bio: this.bio() || currentUser.bio,
        image: this.imageUrl() || currentUser.image,
        password: this.newPassword() || undefined,
      },
    });

    this.userService.updateUser(request).subscribe({
      next: (response) => {
        if (response.user) {
          // Update the user in the store with the new data
          this.authStore.setUser({
            email: response.user.email,
            token: currentUser.token, // Keep existing token
            username: response.user.username,
            bio: response.user.bio,
            image: response.user.image,
          });
          this.router.navigate(['/']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        // Handle error messages
        if (error.error?.errors) {
          const errorMessages = Object.values(error.error.errors).flat() as string[];
          this.errors.set(errorMessages);
        } else {
          this.errors.set(['An error occurred while updating your settings.']);
        }
      },
    });
  }

  logout() {
    this.authStore.clearUser();
    this.router.navigate(['/']);
  }
}
