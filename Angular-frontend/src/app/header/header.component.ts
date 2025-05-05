import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookModel } from '../book-model';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart.service';
import { CartItem } from '../cart-item';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  bookGenres: any[] = [];
  isShopDropdownOpen = false;
  isCartOpen = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) {
    this.getBooks();
    this.cartService.currentCartItems.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  getBooks() {
    this.http.get<BookModel[]>('https://restful-api-sca9.onrender.com/book/').subscribe((res: any) => {
      this.bookGenres = [...new Set(res.map((book: BookModel) => book.genre))];
    });
  }

  navigateToGenre(genre: string) {
    this.closeShopDropdown();
    this.router.navigate(['/Genre'], {
      queryParams: { genre: genre },
      queryParamsHandling: 'merge',
      onSameUrlNavigation: 'reload'
    }).then(() => {
      window.location.reload();
    });
  }

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

  addToCart(book: CartItem) {
    this.cartService.addToCart(book);
  }

  removeItem(bookId: string) {
    this.cartService.removeItem(bookId);
  }

  increaseQuantity(bookId: string) {
    this.cartService.increaseQuantity(bookId);
  }

  decreaseQuantity(bookId: string) {
    this.cartService.decreaseQuantity(bookId);
  }

  clearCart() {
    this.cartService.clearCart();
    this.closeCart();
  }

  calculateTotal(): number {
    this.totalPrice = parseFloat(this.cartItems.reduce(
      (total, item) => total + (item.price * (item.quantity || 1)), 0
    ).toFixed(2));
    return this.totalPrice;
  }

  checkout() {
    console.log('Proceeding to checkout', this.cartItems);
    this.router.navigate(['/checkout']);
  }
}