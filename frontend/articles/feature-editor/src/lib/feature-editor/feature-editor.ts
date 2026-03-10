import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-feature-editor",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="editor-page"><h1>Editor</h1></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureEditor {}
