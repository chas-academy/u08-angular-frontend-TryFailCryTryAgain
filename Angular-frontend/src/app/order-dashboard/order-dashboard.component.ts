import { Component, inject, signal } from '@angular/core';
import { OrderService } from '../api-calls-order.service';
import { OrderModel } from '../order-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

@Component({
  selector: 'app-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  styleUrls: ['./order-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class OrderDashboardComponent {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  selectedOrder = signal<OrderModel | null>(null);
  createSelectedOrder = signal(false);

  orders = toSignal(this.orderService.orders$, { initialValue: [] });

  createForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    bookIds: ['', Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0)]],
    orderDate: ['', Validators.required],
    status: ['Pending', Validators.required]
  });

  editForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    bookIds: ['', Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0)]],
    orderDate: ['', Validators.required],
    status: ['Pending', Validators.required]
  });

  constructor() {
    this.orderService.getOrders().subscribe();
  }

  onDeleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error('Error deleting order:', err)
      });
    }
  }

  toggleCreateForm() {
    this.createSelectedOrder.update(val => !val);
    if (!this.createSelectedOrder()) {
      this.createForm.reset();
      this.createForm.patchValue({ status: 'Pending' });
    }
  }

  displaySelectedOrder(order: OrderModel) {
    this.selectedOrder.set({ ...order });
    this.editForm.patchValue({
      ...order,
      bookIds: order.bookIds.join(', '),
      orderDate: new Date(order.orderDate).toISOString().split('T')[0]
    });
  }

  cancelEdit() {
    this.selectedOrder.set(null);
  }

  onCreateSubmit() {
    if (this.createForm.valid) {
      const formValue = this.createForm.getRawValue();
      const orderData = {
        ...formValue,
        orderDate: new Date(formValue.orderDate).toISOString(),
        bookIds: formValue.bookIds.split(',').map(id => id.trim())
      };


      this.orderService.createOrder(orderData).subscribe({
        next: () => {
          this.createForm.reset();
          this.createForm.patchValue({ status: 'Pending' });
          this.createSelectedOrder.set(false);
          this.refreshOrders();
        },
        error: (err) => console.error('Error creating order:', err)
      });
    }
  }

  onEditSubmit() {
    const selectedOrder = this.selectedOrder();
    if (this.editForm.valid && selectedOrder) {
      const formValue = this.editForm.getRawValue();
      const updatedOrder = {
        ...selectedOrder,
        ...formValue,
        orderDate: new Date(formValue.orderDate).toISOString(),
        bookIds: formValue.bookIds.split(',').map(id => id.trim())
      };

      this.orderService.orders$.pipe(take(1)).subscribe(orders => {
        const updatedOrders = orders.map(order => 
          order._id === selectedOrder._id ? updatedOrder : order
        );
        this.orderService['ordersSubject'].next(updatedOrders);
      });
      
      this.selectedOrder.set(null);
    }
  }

  refreshOrders() {
    this.orderService.refreshOrders().subscribe({
      next: () => console.log('Orders refreshed successfully'),
      error: (err) => console.error('Refresh failed:', err)
    });
  }
}