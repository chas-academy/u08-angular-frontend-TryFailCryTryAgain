// layout.component.ts
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  template: `
  <div class="app-container">
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      }
    `]
})
export class LayoutComponent {}