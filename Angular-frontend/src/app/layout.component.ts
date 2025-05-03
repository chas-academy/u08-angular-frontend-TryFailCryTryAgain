// layout.component.ts
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component'; // Import the component
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,  // If using standalone components
  imports: [HeaderComponent, RouterOutlet, FooterComponent],  // Add HeaderComponent to imports
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
})
export class LayoutComponent {}