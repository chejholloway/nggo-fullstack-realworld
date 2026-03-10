import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureEditor } from './feature-editor';

describe('FeatureEditor', () => {
  let component: FeatureEditor;
  let fixture: ComponentFixture<FeatureEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
