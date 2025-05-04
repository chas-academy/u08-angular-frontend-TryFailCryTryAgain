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
    { label: 'Fiction', link: '/shop/fiction' },
    { label: 'Non-Fiction', link: '/shop/non-fiction' },
    { label: 'Mystery & Thriller', link: '/shop/mystery-thriller' },
    { label: 'Science Fiction', link: '/shop/science-fiction' },
    { label: 'Romance', link: '/shop/romance' },
    { label: 'Biographies', link: '/shop/biographies' },
    { label: 'New Genre', link: '/shop/new-genre' },
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