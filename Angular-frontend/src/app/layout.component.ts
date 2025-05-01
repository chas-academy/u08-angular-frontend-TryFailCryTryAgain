// layout.component.ts
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component'; // Import the component
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,  // If using standalone components
  imports: [HeaderComponent, RouterOutlet],  // Add HeaderComponent to imports
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `,
})
export class LayoutComponent {}