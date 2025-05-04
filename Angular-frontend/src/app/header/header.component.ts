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

  // Will later be drawn from the API call, currently static data into a dynamic layout
  ShopDropDown = [
    { label: 'Fiction', link: '/book/fiction' },
    { label: 'Non-Fiction', link: '/book/non-fiction' },
    { label: 'Mystery & Thriller', link: '/book/mystery-thriller' },
    { label: 'Science Fiction', link: '/book/science-fiction' },
    { label: 'Romance', link: '/book/romance' },
    { label: 'Biographies', link: '/book/biographies' },
    { label: 'New Genre', link: '/book/new-genre' },
  ];

  isShopDropdownOpen = false;

  // Function to toggle the dropdown menus
  toggleShopDropdown(): void {
    this.isShopDropdownOpen = !this.isShopDropdownOpen;
  }

  closeShopDropdown(): void {
    this.isShopDropdownOpen = false;
  }

}