import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedBookComponent } from './selected-book.component';

describe('SelectedBookComponent', () => {
  let component: SelectedBookComponent;
  let fixture: ComponentFixture<SelectedBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
