import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureArticle } from './feature-article';

describe('FeatureArticle', () => {
  let component: FeatureArticle;
  let fixture: ComponentFixture<FeatureArticle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureArticle],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureArticle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
