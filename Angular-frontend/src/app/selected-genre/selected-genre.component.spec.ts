import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedGenreComponent } from './selected-genre.component';

describe('SelectedGenreComponent', () => {
  let component: SelectedGenreComponent;
  let fixture: ComponentFixture<SelectedGenreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedGenreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedGenreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
