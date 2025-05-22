import { Component, inject, signal } from '@angular/core';
import { OrderService } from '../api-calls-order.service';
import { OrderModel } from '../order-model';
import { BookItem } from '../book-item-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  styleUrls: ['./order-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
})
export class OrderDashboardComponent {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  editExistingOrder = signal(false);
  createNewOrder = signal(false);
  selectedBookItems = signal<BookItem[]>([]);
  bookSelectorControl = new FormControl<string>('');
  selectedOrder = signal<OrderModel | null>(null);

  orders = toSignal(this.orderService.orders$, { initialValue: [] });
  users = toSignal(this.orderService.users$, { initialValue: [] });
  books = toSignal(this.orderService.books$, { initialValue: [] });

  createForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    bookIds: this.fb.nonNullable.array<FormControl<string>>([], [Validators.required, Validators.minLength(1)])
  });

  editForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    bookIds: this.fb.nonNullable.array<FormControl<string>>([], [Validators.required, Validators.minLength(1)])
  });

  constructor() {
    this.orderService.fetchOrders().subscribe();
  }

  getSelectedBookItems(): BookItem[] {
    return this.selectedBookItems();
  }

  getBookTitle(bookId: string): string {
    const book = this.books().find(b => b._id === bookId);
    return book ? `${book.title} (${book.price})` : 'Unknown Book';
  }

  toggleCreateForm() {
    this.createNewOrder.update(val => !val);
    if (!this.createNewOrder()) {
      this.createForm.reset();
    }
  }

  addBookToOrder(selectedBookId: string) {

    const bookId = selectedBookId;
    if (!bookId) return;

    const bookIdsArray = this.createForm.get('bookIds') as FormArray<FormControl<string>>;
    const currentItems = this.selectedBookItems();
    const isExistingInArray = currentItems.findIndex(item => item.bookId === bookId);

    if (isExistingInArray >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[isExistingInArray] = {
        ...updatedItems[isExistingInArray],
        quantity: updatedItems[isExistingInArray].quantity + 1
      };
      this.selectedBookItems.set(updatedItems);
      bookIdsArray.push(this.fb.nonNullable.control(bookId));
    } else {
      this.selectedBookItems.set([
        ...currentItems,
        { bookId, quantity: 1 }
      ]);
      bookIdsArray.push(this.fb.nonNullable.control(bookId));
    }
  }

  decreaseBookQuantity(bookId: string) {
    const currentItems = this.selectedBookItems();
    const itemIndex = currentItems.findIndex(item => item.bookId === bookId);
    
    if (itemIndex >= 0) {
      if (currentItems[itemIndex].quantity > 1) {
        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity - 1
        };
        this.selectedBookItems.set(updatedItems);

        if (this.createNewOrder()) {
          const bookIdsArray = this.createForm.get('bookIds') as FormArray<FormControl<string>>;
          const removeIndex = bookIdsArray.value.lastIndexOf(bookId);
          if (removeIndex > -1) {
            bookIdsArray.removeAt(removeIndex);
          }
        } else {
          const bookIdsArray = this.editForm.get('bookIds') as FormArray<FormControl<string>>;
          const removeIndex = bookIdsArray.value.lastIndexOf(bookId);
          if (removeIndex > -1) {
            bookIdsArray.removeAt(removeIndex);
          }
        }

      } else {
        this.removeBook(bookId);
      }
    }
  }

  increaseBookQuantity(bookId: string) {

    const updateItems = this.selectedBookItems().map(item => item.bookId === bookId ? {
      ...item, quantity: item.quantity + 1
      } : item
    );
    this.selectedBookItems.set(updateItems);

    if (this.createNewOrder()) {
      const bookIdsArray = this.createForm.get('bookIds') as FormArray<FormControl<string>>;
      bookIdsArray.push(this.fb.nonNullable.control(bookId));
    } else {
      const bookIdsArray = this.editForm.get('bookIds') as FormArray<FormControl<string>>;
      bookIdsArray.push(this.fb.nonNullable.control(bookId));
    }
    
    
  }

  removeBook(bookId: string) {


    const bookIdsArray = this.createForm.get('bookIds') as FormArray<FormControl<string>>;
    const newArray = bookIdsArray.value.filter(id => id !== bookId);
    bookIdsArray.clear();
    newArray.forEach(id => bookIdsArray.push(this.fb.nonNullable.control(id)));

    const updatedItems = this.selectedBookItems().filter(item => item.bookId !== bookId);
    this.selectedBookItems.set(updatedItems);

  }

  onCreateSubmit() {

    if (this.createForm.valid) {
      const formValue = this.createForm.getRawValue();

      this.orderService.createOrder({
        userId: formValue.userId,
        bookIds: formValue.bookIds,
      }).subscribe({
        next: () => {
          this.createForm.reset();
          this.createNewOrder.set(false);
          this.refreshOrders();
        },
        error: (err) => console.error('Error creating order: ', err)
      });
    }
  }

  openEditOrder(order: OrderModel) {
    console.log(order);
    this.selectedOrder.set(order);
    this.editExistingOrder.set(true);
    
    this.editForm.patchValue({
      userId: order.userId
    });

    const bookIdsArray = this.editForm.get('bookIds') as FormArray<FormControl<string>>;
    bookIdsArray.clear();
    
    order.bookIds.forEach(bookId => {
      bookIdsArray.push(this.fb.nonNullable.control(bookId));
    });

    const itemsWithQuantities = this.calculateQuantities(order.bookIds);
    this.selectedBookItems.set(itemsWithQuantities);
  }

  getSelectedUserName(): string {
    const userId = this.selectedOrder()?.userId;
    const user = this.users().find(u => u._id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  }

  private calculateQuantities(bookIds: string[]): BookItem[] {
    if (!bookIds || bookIds.length === 0) return [];
    
    const quantityMap = bookIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(quantityMap).map(([bookId, quantity]) => ({
      bookId,
      quantity
    }));
  }

  cancelEdit() {
    this.editExistingOrder.set(false);
    this.selectedOrder.set(null);
    this.editForm.reset();
    this.selectedBookItems.set([]);
  }

  onEditSubmit() {
    if (this.editForm.valid) {
      const formValue = this.editForm.getRawValue();
      const orderId = this.selectedOrder()?._id;

      console.log(orderId);
      const books = this.selectedBookItems();
      console.log(books);
      
      if (orderId) {
        this.orderService.updateOrder(orderId, {
        userId: formValue.userId,
        bookIds: formValue.bookIds
      }).subscribe({
        next: () => {
        this.editExistingOrder.set(false);
        this.selectedOrder.set(null);
        this.refreshOrders();
      },
        error: (err) => console.error('Error updating order:', err)
        });
      }
    }
  }

  refreshOrders() {
    this.orderService.refreshOrders().subscribe({
      next: () => console.log('Order refreshed Successfully!'),
      error: (err) => console.error('Refresh failed:', err)
    });
  }

  onDeleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => this.refreshOrders(),
        error: (err) => console.error('Error deleting this order: ', err)
      });
    }
  }

}