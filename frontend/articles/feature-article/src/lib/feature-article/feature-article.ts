import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-feature-article",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="article-page"><h1>Article</h1></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureArticle {}
