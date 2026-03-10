import { Component, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthStore } from "@conduit/auth-data-access";
import { createClient } from "@connectrpc/connect";
import { AuthService } from "@conduit/gen/auth";
import { CONNECT_TRANSPORT } from "@conduit/shared-data-access";

@Component({
  selector: "app-feature-register",
  imports: [RouterLink],
  templateUrl: "./feature-register.html",
  styleUrl: "./feature-register.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureRegister {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly transport = inject(CONNECT_TRANSPORT);
  private readonly client = createClient(AuthService, this.transport);

  protected readonly username = signal("");
  protected readonly email = signal("");
  protected readonly password = signal("");
  protected readonly errors = signal<string[]>([]);
  protected readonly loading = signal(false);

  protected async onSubmit() {
    this.errors.set([]);
    this.loading.set(true);

    try {
      const response = await this.client.register({
        username: this.username(),
        email: this.email(),
        password: this.password(),
      });

      if (response.user) {
        this.authStore.setUser({
          email: response.user.email,
          token: response.user.token,
          username: response.user.username,
          bio: response.user.bio,
          image: response.user.image,
        });
        await this.router.navigate(["/"]);
      }
    } catch (error: any) {
      this.errors.set([error.message || "Registration failed"]);
    } finally {
      this.loading.set(false);
    }
  }
}
