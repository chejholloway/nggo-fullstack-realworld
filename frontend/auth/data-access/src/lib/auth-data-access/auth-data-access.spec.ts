import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthDataAccess } from './auth-data-access';

describe('AuthDataAccess', () => {
  let component: AuthDataAccess;
  let fixture: ComponentFixture<AuthDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
