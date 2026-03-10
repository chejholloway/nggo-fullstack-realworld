import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ArticlesService } from "@conduit/articles-data-access";
import { AuthStore } from "@conduit/auth-data-access";

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
    // For now, we'll create a mock profile from articles
    // In a real app, you'd call a profile service
    this.profile.set({
      username,
      bio: "A passionate writer",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      following: false,
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

  setTab(tab: "my" | "favorited") {
    this.activeTab.set(tab);
  }
}
