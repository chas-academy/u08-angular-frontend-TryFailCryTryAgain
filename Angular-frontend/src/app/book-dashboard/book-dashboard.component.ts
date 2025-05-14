import { Component, inject, signal } from '@angular/core';
import { ApiCallsService } from '../api-calls.service';
import { BookModel } from '../book-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

@Component({
  selector: 'app-book-dashboard',
  templateUrl: './book-dashboard.component.html',
  styleUrls: ['./book-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class BookDashboardComponent {
  private apiService = inject(ApiCallsService);
  private fb = inject(FormBuilder);

  selectedBook = signal<BookModel | null>(null);
  CreateSelectedBook = signal(false);

  books = toSignal(this.apiService.books$, { initialValue: [] });

  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    author: ['', Validators.required],
    genre: ['Fiction', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    publishedDate: ['', Validators.required],
    description: ['']
  });

  // Edit form with validation
  editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    author: ['', Validators.required],
    genre: ['Fiction', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    publishedDate: ['', Validators.required],
    description: ['']
  });

  constructor() {
    this.apiService.getBooks().subscribe();
  }

  onDeleteBook(bookId: string) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.apiService.deleteBook(bookId).subscribe({
        next: () => {
          console.log('Book deleted successfully');
          this.freshBookUpdate();
        },
        error: (err) => console.error('Error deleting book:', err)
      });
    }
  }

  toggleCreateForm() {
    this.CreateSelectedBook.update(val => !val);
    if (!this.CreateSelectedBook()) {
      this.createForm.reset();
      this.createForm.patchValue({ genre: 'Fiction' });
    }
  }

  displaySelectedBook(book: BookModel) {
    this.selectedBook.set({ ...book });
    this.editForm.patchValue({
      ...book,
      publishedDate: new Date(book.publishedDate).toISOString().split('T')[0]
    });
  }

  cancelEdit() {
    this.selectedBook.set(null);
  }

  onCreateSubmit() {
    if (this.createForm.valid) {
      const formValue = this.createForm.getRawValue();
      const bookData = {
        ...formValue,
        publishedDate: new Date(formValue.publishedDate).toISOString()
      };

      this.apiService.createBook(bookData).subscribe({
        next: () => {
          console.log('Book created successfully');
          this.createForm.reset();
          this.createForm.patchValue({ genre: 'Fiction' });
          this.CreateSelectedBook.set(false);
          this.freshBookUpdate();
        },
        error: (err) => console.error('Error creating book:', err)
      });
    }
  }

  onEditSubmit() {
    const selectedBook = this.selectedBook();
    if (this.editForm.valid && selectedBook) {
      const formValue = this.editForm.getRawValue();
      const updatedBook = {
        ...selectedBook,
        ...formValue,
        publishedDate: new Date(formValue.publishedDate).toISOString()
      };

      console.log('Would update book:', selectedBook._id, 'with:', updatedBook);
      
      this.apiService.books$.pipe(take(1)).subscribe(books => {
        const updatedBooks = books.map(book => 
          book._id === selectedBook._id ? updatedBook : book
        );
        this.apiService['booksSubject'].next(updatedBooks);
      });
      
      this.selectedBook.set(null);
    }
  }

  freshBookUpdate() {
    this.apiService.refreshBooks().subscribe({
      next: () => console.log('Data refreshed successfully'),
      error: (err) => console.error('Refresh failed:', err)
    });
  }
}