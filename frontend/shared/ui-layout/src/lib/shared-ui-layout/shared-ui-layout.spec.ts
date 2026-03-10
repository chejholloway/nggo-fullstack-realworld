import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUiLayout } from './shared-ui-layout';

describe('SharedUiLayout', () => {
  let component: SharedUiLayout;
  let fixture: ComponentFixture<SharedUiLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUiLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedUiLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
