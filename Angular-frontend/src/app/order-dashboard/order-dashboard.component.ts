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

  selectedOrder = signal<OrderModel | null>(null);
  createSelectedOrder = signal(false);
  selectedBookId = '';
  bookSelectorControl = new FormControl<string>('');
  selectedBookItems = signal<BookItem[]>([]);
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
    bookItems: this.fb.nonNullable.array<BookItem>([], [Validators.required, Validators.minLength(1)])
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
    
    // Convert bookIds array to bookItems format
    const bookItems = this.convertBookIdsToItems(order.bookIds);

    this.editForm.reset();
    
    this.editForm.patchValue({
      userId: order.userId,
      bookItems
    });
    
    this.selectedBookItems.set(bookItems);

    this.editForm.markAsDirty();
  }

  cancelEdit() {
    this.selectedOrder.set(null);
  }

  private convertBookIdsToItems(bookIds: string[]): BookItem[] {
    const countMap = new Map<string, number>();
    bookIds.forEach(id => {
      countMap.set(id, (countMap.get(id) || 0) + 1);
    });
    
    return Array.from(countMap.entries()).map(([bookId, quantity]) => ({
      bookId,
      quantity
    }));
  }

  private convertItemsToBookIds(items: BookItem[]): string[] {
    return items.flatMap(item => 
      Array(item.quantity).fill(item.bookId)
    );
  }

  getSelectedBookItems(): BookItem[] {
    return this.selectedBookItems();
  }

  getBookTitle(bookId: string): string {
    const book = this.books().find(b => b._id === bookId);
    return book ? `${book.title} (${book.price})` : 'Unknown Book';
  }

  addBookToOrder() {
      const bookId = this.bookSelectorControl.value;
      if (!bookId) return;

      const currentItems = this.selectedBookItems();
      const existingItemIndex = currentItems.findIndex(item => item.bookId === bookId);

      if (existingItemIndex >= 0) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + 1
          };
          this.selectedBookItems.set(updatedItems);
      } else {
          this.selectedBookItems.set([
              ...currentItems,
              { bookId, quantity: 1 }
          ]);
      }

      this.updateFormBookItems();
      this.bookSelectorControl.reset();
  }

  increaseBookQuantity(bookId: string) {
    const updatedItems = this.selectedBookItems().map(item => 
      item.bookId === bookId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    this.selectedBookItems.set(updatedItems);
    this.updateFormBookItems();
  }

  decreaseBookQuantity(bookId: string) {
    const currentItems = this.selectedBookItems();
    const itemIndex = currentItems.findIndex(item => item.bookId === bookId);
    
    if (itemIndex >= 0) {
      if (currentItems[itemIndex].quantity > 1) {
        // Decrease quantity if more than 1
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
        // Remove if quantity would become 0
        this.removeBook(bookId);
        return;
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
    const updatedItems = this.selectedBookItems().filter(item => item.bookId !== bookId);
    this.selectedBookItems.set(updatedItems);
    this.updateFormBookItems();
  }

  private updateFormBookItems() {
    const bookItems = this.selectedBookItems();
    const bookItemsControl = this.editForm.get('bookItems');
    
    // Completely replace the array
    bookItemsControl?.setValue(bookItems);
    
    // Manually update validity
    bookItemsControl?.updateValueAndValidity();
    this.editForm.updateValueAndValidity();
  }

  onEditSubmit() {
    const selectedOrder = this.selectedOrder();
    if (this.editForm.valid && selectedOrder) {
      const formValue = this.editForm.getRawValue();
      const bookIds = this.convertItemsToBookIds(formValue.bookItems);
      
      const updatedOrder = {
        ...selectedOrder,
        userId: formValue.userId,
        bookIds,
        totalAmount: this.calculateTotal(bookIds),
        orderDate: new Date().toISOString(),
        status: 'Pending'
      };

      this.orderService.updateOrder(updatedOrder).subscribe({
        next: () => {
          this.selectedOrder.set(null);
          this.refreshOrders();
        },
        error: (err) => console.error('Error updating order:', err)
      });
    } else {
      console.log('Form is invalid:', this.editForm.errors);
      this.editForm.markAllAsTouched();
    }
  }

  updateOrder(order: OrderModel): Observable<OrderModel> {
    return this.orderService.updateOrder(order); // Delegate to OrderService
  }

  toggleCreateFormBookSelection(bookId: string) {
    const bookIdsControl = this.createForm.get('bookIds');
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

    this.onBooksChange(bookIdsControl.value as string[], 'create');
  }

  calculateTotal(bookIds: string[]): number {
    const books = this.books();
    return bookIds.reduce((total, bookId) => {
      const book = books.find(b => b._id === bookId);
      return total + (book?.price || 0);
    }, 0);
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
          this.createNewOrder.set(false);
          this.refreshOrders();
        },
        error: (err) => console.error('Error creating order:', err)
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