import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiArticlePreview } from './ui-article-preview';

describe('UiArticlePreview', () => {
  let component: UiArticlePreview;
  let fixture: ComponentFixture<UiArticlePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiArticlePreview],
    }).compileComponents();

    fixture = TestBed.createComponent(UiArticlePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
