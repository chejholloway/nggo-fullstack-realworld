import { Component, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthStore } from "@conduit/auth-data-access";
import { firstValueFrom } from "rxjs";

const API_BASE = "/conduit-api";

@Component({
  selector: "app-feature-login",
  imports: [RouterLink],
  templateUrl: "./feature-login.html",
  styleUrl: "./feature-login.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureLogin {
  private readonly authStore = inject(AuthStore);
  private readonly router    = inject(Router);
  private readonly http      = inject(HttpClient);

  protected readonly email    = signal("");
  protected readonly password = signal("");
  protected readonly errors   = signal<string[]>([]);
  protected readonly loading  = signal(false);

  protected async onSubmit() {
    this.errors.set([]);
    this.loading.set(true);

    try {
      const response: any = await firstValueFrom(
        this.http.post(`${API_BASE}/users/login`, {
          user: { email: this.email(), password: this.password() },
        })
      );

      if (response?.user) {
        this.authStore.setUser(response.user);
        await this.router.navigate(["/"]);
      }
    } catch (error: any) {
      const body = error?.error;
      const msgs: string[] = [];
      if (body?.errors) {
        for (const [field, errs] of Object.entries(body.errors)) {
          for (const msg of errs as string[]) {
            msgs.push(`${field} ${msg}`);
          }
        }
      }
      this.errors.set(msgs.length ? msgs : ["Login failed. Please check your credentials."]);
    } finally {
      this.loading.set(false);
    }
  }
}
