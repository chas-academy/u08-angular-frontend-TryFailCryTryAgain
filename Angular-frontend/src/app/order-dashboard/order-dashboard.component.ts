import { Component, inject, signal } from '@angular/core';
import { OrderService } from '../api-calls-order.service';
import { OrderModel } from '../order-model';
import { UserModel } from '../user-model';
import { BookModel } from '../book-model';
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
  selectedBooks = signal<string[]>([]);

  orders = toSignal(this.orderService.orders$, { initialValue: [] });
  users = toSignal(this.orderService.users$, { initialValue: [] });
  books = toSignal(this.orderService.books$, { initialValue: [] });

  createForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    bookIds: this.fb.nonNullable.array<string>([], Validators.required),
    totalAmount: [0, [Validators.required, Validators.min(0)]],
    orderDate: ['', Validators.required],
    status: ['Pending', Validators.required]
  });

  editForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    bookIds: this.fb.nonNullable.array<string>([], Validators.required),
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
      bookIds: order.bookIds,
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
        bookIds: formValue.bookIds
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
        bookIds: formValue.bookIds
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

  toggleBookSelection(bookId: string, form: 'create' | 'edit') {
    const formGroup = form === 'create' ? this.createForm : this.editForm;
    const bookIdsControl = formGroup.get('bookIds');
    if (!bookIdsControl) return;

    const currentBooks = bookIdsControl.value as string[] || [];

    if (currentBooks.includes(bookId)) {
      bookIdsControl.patchValue(
        currentBooks.filter(id => id !== bookId)
      );
    } else {
      bookIdsControl.patchValue(
        [...currentBooks, bookId]
      );
    }
  
    this.onBooksChange(bookIdsControl.value as string[], form);
  }

  calculateTotal(bookIds: string[]): number {
    const books = this.books();
    return bookIds.reduce((total, bookId) => {
      const book = books.find(b => b._id === bookId);
      return total + (book?.price || 0);
    }, 0);
  }

  onBooksChange(bookIds: string[], form: 'create' | 'edit') {
    const total = this.calculateTotal(bookIds);
    if (form === 'create') {
      this.createForm.patchValue({ totalAmount: total });
    } else {
      this.editForm.patchValue({ totalAmount: total });
    }
  }

  refreshOrders() {
    this.orderService.refreshOrders().subscribe({
      next: () => console.log('Orders refreshed successfully'),
      error: (err) => console.error('Refresh failed:', err)
    });
  }
}