import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-page2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page2.component.html',
  styles: [`
    .error { color: red; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; }
  `]
})
export class Page2Component {

  constructor(private http: HttpClient) {

  }

}