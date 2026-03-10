import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileFeatureProfile } from './profile-feature-profile';

describe('ProfileFeatureProfile', () => {
  let component: ProfileFeatureProfile;
  let fixture: ComponentFixture<ProfileFeatureProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileFeatureProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFeatureProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
