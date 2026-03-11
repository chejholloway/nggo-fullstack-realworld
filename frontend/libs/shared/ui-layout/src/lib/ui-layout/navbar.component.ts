import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthStore } from '@conduit/auth-data-access';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  user = this.authStore.user;
  isLoggedIn = computed(() => this.authStore.isLoggedIn());

  logout() {
    this.authStore.clearUser();
    this.router.navigate(['/']);
  }
}
