import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileUiAvatar } from './profile-ui-avatar';

describe('ProfileUiAvatar', () => {
  let component: ProfileUiAvatar;
  let fixture: ComponentFixture<ProfileUiAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileUiAvatar],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileUiAvatar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
