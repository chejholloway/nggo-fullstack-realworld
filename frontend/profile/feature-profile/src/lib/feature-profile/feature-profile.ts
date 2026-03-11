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
  private route           = inject(ActivatedRoute);
  private articlesService = inject(ArticlesService);
  protected authStore     = inject(AuthStore);
  private profileService  = inject(ProfileService);

  profile   = signal<any>(null);
  articles  = signal<any[]>([]);
  activeTab = signal<"my" | "favorited">("my");
  loading   = signal(true);

  isOwnProfile = computed(() =>
    this.profile()?.username === this.authStore.username()
  );

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get("username");
    if (username) {
      this.loadProfile(username);
      this.loadArticles(username, "my");
    }
  }

  loadProfile(username: string) {
    this.profileService.getProfile(username).subscribe({
      next: (res) => this.profile.set(res.profile),
      error: (err) => console.error(err),
    });
  }

  loadArticles(username: string, tab: "my" | "favorited") {
    this.loading.set(true);
    const source$ = tab === "favorited"
      ? this.articlesService.getFavoritedBy(username)
      : this.articlesService.getByAuthor(username);

    source$.subscribe({
      next: (res) => {
        this.articles.set(res.articles ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: "my" | "favorited") {
    this.activeTab.set(tab);
    const username = this.route.snapshot.paramMap.get("username");
    if (username) this.loadArticles(username, tab);
  }

  toggleFollow() {
    const p = this.profile();
    if (!p) return;
    const action$ = p.following
      ? this.profileService.unfollowUser(p.username)
      : this.profileService.followUser(p.username);
    action$.subscribe({
      next: (res: any) => this.profile.set(res.profile),
      error: (err: any) => console.error(err),
    });
  }
}
