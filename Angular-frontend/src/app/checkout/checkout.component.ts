import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartItem } from '../cart-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  totalprice = 0;

  constructor(private fb: FormBuilder, private router: Router) {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['credit-card', Validators.required]
    });
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.cartItems = navigation.extras.state['cartItems'];
    }
    console.log(this.cartItems);
  }

  get totalPrice(): number {
    return parseFloat(this.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    ).toFixed(2));
  }

  getItemTotal(item: any): number {
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
      alert('Order submitted successfully!');
    } else {
      alert('Please fill out all required fields correctly.');
    }
  }

  removeItem(id: string): void {
    this.cartItems = this.cartItems.filter(item => item._id !== id);
  }

  updateQuantity(item: any, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      item.quantity = newQuantity;
    } else {
      this.removeItem(item.id);
    }
  }
}