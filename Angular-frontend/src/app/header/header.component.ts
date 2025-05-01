// header.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Navigation items could be managed here
  navItems = [
    { path: '/', label: 'Home' },
    { path: '/genres', label: 'Genres' },
    { path: '/authors', label: 'Authors' },
    { path: '/login', label: 'Login' },
    { path: '/contact', label: 'Contact' },
    { path: '/steve', label: 'Steve'}
  ];
}