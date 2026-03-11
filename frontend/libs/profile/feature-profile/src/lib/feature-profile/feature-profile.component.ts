import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProfileService } from '@conduit/profile-data-access';
import { ArticlesService } from '@conduit/articles-data-access';
import { AuthStore } from '@conduit/auth-data-access';

type ProfileTab = 'articles' | 'favorites';

@Component({
  selector: 'app-feature-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feature-profile.component.html',
  styleUrl: './feature-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private articlesService = inject(ArticlesService);
  private authStore = inject(AuthStore);
  private route = inject(ActivatedRoute);

  profile = signal<any>(null);
  articles = signal<any[]>([]);
  favorites = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal<ProfileTab>('articles');
  isFollowing = signal(false);

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.loadProfile(username);
    }
  }

  loadProfile(username: string) {
    this.loading.set(true);
    
    // Load profile
    this.profileService.getProfile(username).subscribe({
      next: (response: any) => {
        this.profile.set(response.profile);
        this.isFollowing.set(response.profile?.following || false);
        this.loadUserArticles(username);
        this.loadUserFavorites(username);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadUserArticles(username: string) {
    this.articlesService.getByAuthor(username).subscribe({
      next: (response: any) => {
        this.articles.set(response.articles || []);
      },
    });
  }

  loadUserFavorites(username: string) {
    this.articlesService.getFavorites(username).subscribe({
      next: (response: any) => {
        this.favorites.set(response.articles || []);
      },
    });
  }

  toggleFollow() {
    const username = this.profile()?.username;
    if (!username) return;

    const action$ = this.isFollowing()
      ? this.profileService.unfollowUser(username)
      : this.profileService.followUser(username);

    action$.subscribe({
      next: (response: any) => {
        if (response.profile) {
          this.profile.set(response.profile);
          this.isFollowing.set(response.profile.following);
        }
      },
    });
  }

  toggleFavorite(article: any) {
    const action$ = article.favorited
      ? this.articlesService.unfavorite(article.slug)
      : this.articlesService.favorite(article.slug);

    (action$ as any).subscribe((res: any) => {
      // Update both articles and favorites arrays
      this.articles.update(prev =>
        prev.map((a: any) => a.slug === article.slug ? (res?.article ?? a) : a)
      );
      this.favorites.update(prev =>
        prev.map((a: any) => a.slug === article.slug ? (res?.article ?? a) : a)
      );
    });
  }

  setActiveTab(tab: ProfileTab) {
    this.activeTab.set(tab);
  }

  canEditProfile(): boolean {
    const currentUser = this.authStore.user();
    const profileUser = this.profile();
    return currentUser && profileUser && currentUser.username === profileUser.username;
  }
}
