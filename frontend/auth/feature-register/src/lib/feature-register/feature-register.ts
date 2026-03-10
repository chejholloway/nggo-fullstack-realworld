import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-feature-register",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="auth-page"><h1>Sign Up</h1></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureRegister {}
