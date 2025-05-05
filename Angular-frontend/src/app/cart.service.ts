import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  currentCartItems = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadInitialCart();
  }

  private loadInitialCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
  }

  private updateCart(items: CartItem[]) {
    this.cartItemsSubject.next(items);
    localStorage.setItem('cart', JSON.stringify(items));
  }

  addToCart(item: CartItem) {
    const currentItems = this.cartItemsSubject.getValue();
    const existingItem = currentItems.find(i => i._id === item._id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      currentItems.push(item);
    }
    
    this.updateCart([...currentItems]);
  }

  removeItem(bookId: string) {
    const currentItems = this.cartItemsSubject.getValue().filter(item => item._id !== bookId);
    this.updateCart(currentItems);
  }

  increaseQuantity(bookId: string) {
    const currentItems = this.cartItemsSubject.getValue();
    const item = currentItems.find(item => item._id === bookId);
    if (item) {
      item.quantity++;
      this.updateCart([...currentItems]);
    }
  }

  decreaseQuantity(bookId: string) {
    const currentItems = this.cartItemsSubject.getValue();
    const item = currentItems.find(item => item._id === bookId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeItem(bookId);
        return;
      }
      this.updateCart([...currentItems]);
    }
  }

  clearCart() {
    this.cartItemsSubject.next([]);
    localStorage.removeItem('cart');
  }

  getCurrentCart(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }
}