import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ArticlesService } from "@conduit/articles-data-access";
import { AuthStore } from "@conduit/auth-data-access";
import { ProfileService } from "@conduit/profile-data-access";

@Component({
  selector: "app-profile-feature-profile",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./feature-profile.html",
  styleUrl: "./feature-profile.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFeatureProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private articlesService = inject(ArticlesService);
  protected authStore = inject(AuthStore);
  private profileService = inject(ProfileService);

  profile = signal<any>(null);
  articles = signal<any[]>([]);
  activeTab = signal<"my" | "favorited">("my");
  loading = signal(true);

  isOwnProfile = computed(() => {
    return this.profile()?.username === this.authStore.username();
  });

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get("username");
    if (username) {
      this.loadProfile(username);
      this.loadArticles(username);
    }
  }

  loadProfile(username: string) {
    this.profileService.getProfile(username).subscribe({
      next: (res) => {
        this.profile.set(res.profile);
      },
      error: (err) => console.error(err),
    });
  }

  loadArticles(username: string) {
    this.loading.set(true);
    this.articlesService.getFeed(0, 20).subscribe({
      next: (res) => {
        // Filter articles by author
        const filtered = (res.articles || []).filter(
          (a: any) => a.author?.username === username
        );
        this.articles.set(filtered);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleFollow() {
    const currentProfile = this.profile();
    if (!currentProfile) return;

    if (currentProfile.following) {
      this.profileService.unfollowUser(currentProfile.username).subscribe({
        next: (res) => this.profile.set(res.profile),
        error: (err) => console.error(err),
      });
    } else {
      this.profileService.followUser(currentProfile.username).subscribe({
        next: (res) => this.profile.set(res.profile),
        error: (err) => console.error(err),
      });
    }
  }

  setTab(tab: "my" | "favorited") {
    this.activeTab.set(tab);
  }

  toggleFollowAuthor(authorUsername: string, isFollowing: boolean) {
    if (isFollowing) {
      this.profileService.unfollowUser(authorUsername).subscribe({
        next: (res) => {
          this.articles.update((articles) =>
            articles.map((article) =>
              article.author?.username === authorUsername
                ? { ...article, author: res.profile }
                : article
            )
          );
        },
        error: (err) => console.error(err),
      });
    } else {
      this.profileService.followUser(authorUsername).subscribe({
        next: (res) => {
          this.articles.update((articles) =>
            articles.map((article) =>
              article.author?.username === authorUsername
                ? { ...article, author: res.profile }
                : article
            )
          );
        },
        error: (err) => console.error(err),
      });
    }
  }
}
