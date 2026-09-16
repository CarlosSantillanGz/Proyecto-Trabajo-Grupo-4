import { ComponentFixture, TestBed } from '@angular/core/testing';
import { B2bForm } from './b2b-form';

describe('B2bForm', () => {
  let component: B2bForm;
  let fixture: ComponentFixture<B2bForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [B2bForm],
    }).compileComponents();

    fixture = TestBed.createComponent(B2bForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
