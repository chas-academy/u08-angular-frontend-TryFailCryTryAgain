// header.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(private router: Router) {}

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

  // Mock cart items data
  cartItems = [
    { 
      id: '001', 
      title: 'The Silent Patient', 
      author: 'Alex Michaelides',
      quantity: 1, 
      price: 12.99,
      image: 'https://example.com/silent-patient.jpg'
    },
    { 
      id: '002', 
      title: 'Dune', 
      author: 'Frank Herbert',
      quantity: 2, 
      price: 9.99,
      image: 'https://example.com/dune.jpg'
    },
    { 
      id: '003', 
      title: 'Atomic Habits', 
      author: 'James Clear',
      quantity: 1, 
      price: 14.95,
      image: 'https://example.com/atomic-habits.jpg'
    }
  ];

  isCartOpen = false;
  totalPrice = this.calculateTotal(); // Initialize total price

  // Function to toggle the dropdown menus
  toggleShopDropdown(): void {
    this.isShopDropdownOpen = !this.isShopDropdownOpen;
  }

  closeShopDropdown(): void {
    this.isShopDropdownOpen = false;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  closeCart() {
    this.isCartOpen = false;
  }

  addToCart(book: any) {
    const existingItem = this.cartItems.find(item => item.id === book.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({ ...book, quantity: 1 });
    }
    this.calculateTotal();
  }

  removeItem(bookId: string) {
    this.cartItems = this.cartItems.filter(item => item.id !== bookId);
    this.calculateTotal();
  }

  increaseQuantity(bookId: string) {
    const item = this.cartItems.find(item => item.id === bookId);
    if (item) {
      item.quantity++;
      this.calculateTotal();
    }
  }

  decreaseQuantity(bookId: string) {
    const item = this.cartItems.find(item => item.id === bookId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeItem(bookId);
      }
      this.calculateTotal();
    }
  }

  clearCart() {
    this.cartItems = [];
    this.totalPrice = 0;
    this.closeCart();
  }

  calculateTotal(): number {
    this.totalPrice = parseFloat(this.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    ).toFixed(2));
    return this.totalPrice;
  }

  checkout() {
    // Implement your checkout logic
    console.log('Proceeding to checkout', this.cartItems);
    this.router.navigate(['/checkout']);
    // You might want to navigate to a checkout page
    // this.router.navigate(['/checkout']);
  }
}