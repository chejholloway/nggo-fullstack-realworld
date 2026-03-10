import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-profile-feature-profile",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="profile-page"><h1>Profile</h1></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFeatureProfile {}
