import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFeed } from './feature-feed';

describe('FeatureFeed', () => {
  let component: FeatureFeed;
  let fixture: ComponentFixture<FeatureFeed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureFeed],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureFeed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
