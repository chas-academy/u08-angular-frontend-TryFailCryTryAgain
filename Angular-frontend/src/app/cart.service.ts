// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookModel } from './book-model';
import { CartItem } from './cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  currentCartItems = this.cartItems.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
    }
  }

  private updateCart(items: CartItem[]) {
    this.cartItems.next(items);
    localStorage.setItem('cart', JSON.stringify(items));
  }

  addToCart(item: CartItem) {
    const currentItems = this.cartItems.getValue();
    const existingItem = currentItems.find(i => i._id === item._id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      currentItems.push(item);
    }
    
    this.updateCart([...currentItems]);
  }

  removeItem(bookId: string) {
    const currentItems = this.cartItems.getValue().filter(item => item._id !== bookId);
    this.cartItems.next(currentItems);
  }

  increaseQuantity(bookId: string) {
    const currentItems = this.cartItems.getValue();
    const item = currentItems.find(item => item._id === bookId);
    if (item) {
      item.quantity++;
      this.cartItems.next([...currentItems]);
    }
  }

  decreaseQuantity(bookId: string) {
    const currentItems = this.cartItems.getValue();
    const item = currentItems.find(item => item._id === bookId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeItem(bookId);
        return;
      }
      this.cartItems.next([...currentItems]);
    }
  }

  clearCart() {
    this.cartItems.next([]);
  }
}