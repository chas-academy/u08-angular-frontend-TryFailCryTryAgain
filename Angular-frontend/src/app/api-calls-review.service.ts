import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ReviewModel } from './review-model';
import { UserModel } from './user-model';
import { BookModel } from './book-model';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsUrl = 'https://restful-api-sca9.onrender.com/review/';
  private userUrl = 'https://restful-api-sca9.onrender.com/user/';
  private booksUrl = 'https://restful-api-sca9.onrender.com/book/';
  private deleteReviewUrl = 'https://restful-api-sca9.onrender.com/review/';
  private reviewsSubject = new BehaviorSubject<ReviewModel[]>([]);
  private usersSubject = new BehaviorSubject<UserModel[]>([]);
  private booksSubject = new BehaviorSubject<BookModel[]>([]);
  private readonly cacheKey = 'cachedReviews';

  reviews$ = this.reviewsSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  books$ = this.booksSubject.asObservable();


  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  createReview(reviewData: Omit<ReviewModel, '_id'>): Observable<ReviewModel> {
    return this.http.post<ReviewModel>(this.reviewsUrl, reviewData).pipe(
      tap(newReview => {
        const currentReviews = this.reviewsSubject.value;
        this.reviewsSubject.next([...currentReviews, newReview]);
        this.cacheData([...currentReviews, newReview]);
      }),
      shareReplay(1)
    );
  }

  deleteReview(reviewId: string): Observable<any> {
    const deleteUrl = `${this.deleteReviewUrl}${reviewId}`;
    
    return this.http.delete(deleteUrl).pipe(
      tap(() => {
        const currentReviews = this.reviewsSubject.value;
        const updatedReviews = currentReviews.filter(review => review._id !== reviewId);
        this.reviewsSubject.next(updatedReviews);
        this.cacheData(updatedReviews);
      })
    );
  }

  getReviews(): Observable<ReviewModel[]> {
    if (this.reviewsSubject.value.length > 0) {
      return this.reviews$;
    }

    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.reviewsSubject.next(parsedData.reviews);
      return this.reviews$;
    }

    return this.http.get<ReviewModel[]>(this.reviewsUrl).pipe(
      tap((reviews: ReviewModel[]) => {
        this.reviewsSubject.next(reviews);
        this.cacheData(reviews);
      })
    );
  }

  private loadInitialData(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.reviewsSubject.next(parsedData.reviews);
    }
  }

  private cacheData(reviews: ReviewModel[]): void {
    const dataToCache = {
      reviews,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(dataToCache));
  }

  clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    this.reviewsSubject.next([]);
  }

  refreshReviews(): Observable<ReviewModel[]> {
    return this.http.get<ReviewModel[]>(this.reviewsUrl).pipe(
      tap((reviews: ReviewModel[]) => {
        this.reviewsSubject.next(reviews);
        this.cacheData(reviews);
      })
    );
  }
}