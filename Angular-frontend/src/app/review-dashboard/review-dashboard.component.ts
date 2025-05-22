import { Component, inject, signal } from '@angular/core';
import { ReviewService } from '../api-calls-review.service';
import { ReviewModel } from '../review-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { UserService } from '../api-calls-users.service';
import { BookService } from '../book.service';

@Component({
  selector: 'app-review-dashboard',
  templateUrl: './review-dashboard.component.html',
  styleUrls: ['./review-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class ReviewDashboardComponent {
  private reviewService = inject(ReviewService);
  private userService = inject(UserService);
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);

  selectedReview = signal<ReviewModel | null>(null);
  createSelectedReview = signal(false);

  reviews = toSignal(this.reviewService.reviews$, { initialValue: [] });
  users = toSignal(this.userService.getUsers(), { initialValue: [] });
  books = toSignal(this.bookService.fetchBooks(), { initialValue: [] });

  createForm = this.fb.nonNullable.group({
    bookId: ['', Validators.required],
    userId: ['', Validators.required],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
    date: ['', Validators.required]
  });

  editForm = this.fb.nonNullable.group({
    bookId: ['', Validators.required],
    userId: ['', Validators.required],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
    date: ['', Validators.required]
  });

  constructor() {
    this.reviewService.getReviews().subscribe();
    this.userService.getUsers().subscribe();
  }

  onDeleteReview(reviewId: string) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => this.refreshReviews(),
        error: (err) => console.error('Error deleting review:', err)
      });
    }
  }

  toggleCreateForm() {
    this.createSelectedReview.update(val => !val);
    if (!this.createSelectedReview()) {
      this.createForm.reset();
    }
  }

  displaySelectedReview(review: ReviewModel) {
    console.log(review._id);
    this.selectedReview.set({ ...review });
    this.editForm.patchValue({
      ...review,
      date: new Date(review.date).toISOString().split('T')[0]
    });
  }

  cancelEdit() {
    this.selectedReview.set(null);
  }

  onCreateSubmit() {
    if (this.createForm.valid) {
      const formValue = this.createForm.getRawValue();
      const reviewData = {
        ...formValue,
        date: new Date(formValue.date).toISOString()
      };

      this.reviewService.createReview(reviewData).subscribe({
        next: () => {
          this.createForm.reset();
          this.createSelectedReview.set(false);
          this.refreshReviews();
        },
        error: (err) => console.error('Error creating review:', err)
      });
    }
  }

  onEditSubmit() {
    const selectedReview = this.selectedReview();
    if (this.editForm.valid && selectedReview) {
      const formValue = this.editForm.getRawValue();
      const updatedReview = {
        ...selectedReview,
        ...formValue,
        date: new Date(formValue.date).toISOString()
      };

      this.reviewService.reviews$.pipe(take(1)).subscribe(reviews => {
        const updatedReviews = reviews.map(review => 
          review._id === selectedReview._id ? updatedReview : review
        );
        this.reviewService['reviewsSubject'].next(updatedReviews);
      });
      
      this.selectedReview.set(null);
    }
  }

  refreshReviews() {
    this.reviewService.refreshReviews().subscribe({
      next: () => console.log('Reviews refreshed successfully'),
      error: (err) => console.error('Refresh failed:', err)
    });
  }
}