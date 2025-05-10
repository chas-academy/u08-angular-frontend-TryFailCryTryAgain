import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartItem } from '../cart-item';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  totalPrice = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService
  ) {
    this.checkoutForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['credit-card', Validators.required]
    });
  }

  ngOnInit() {
    this.cartService.currentCartItems.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.calculateTotal();
    });
  }

  calculateTotal(): number {
    return parseFloat(this.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    ).toFixed(2));
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      const order = {
        customerDetails: this.checkoutForm.value,
        items: this.cartItems,
        total: this.totalPrice,
        orderDate: new Date().toISOString()
      };
      
      console.log('Order submitted:', order);
      // Here you would typically send the order to your backend
      this.cartService.clearCart();
      alert('Order submitted successfully!');
      this.router.navigate(['/']);
    } else {
      alert('Please fill out all required fields correctly.');
    }
  }

  removeItem(id: string): void {
    this.cartService.removeItem(id);
  }

  updateQuantity(item: CartItem, change: number): void {
    if (change > 0) {
      this.cartService.increaseQuantity(item._id);
    } else {
      this.cartService.decreaseQuantity(item._id);
    }
  }
}