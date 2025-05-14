import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BookModel } from './book-model';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  private booksUrl = 'https://restful-api-sca9.onrender.com/book/';
  private deleteBookUrl = 'https://restful-api-sca9.onrender.com/book/';
  private booksSubject = new BehaviorSubject<BookModel[]>([]);
  private readonly cacheKey = 'cachedBooks';

  books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load cached data on service initialization
    this.loadInitialData();
  }

  // Signal State management
  private booksSignal = signal<BookModel[]>([]);
  books = this.booksSignal.asReadonly();

  createBook(bookData: Omit<BookModel, '_id'>): Observable<BookModel> {
    return this.http.post<BookModel>(this.booksUrl, bookData).pipe(
      tap(newBook => {
        // Update the signal with the new book
        this.booksSignal.update(books => [...books, newBook]);
      }),
      shareReplay(1) // Cache the response for multiple subscribers
    );
  }


  deleteBook(bookId: string): Observable<any> {
    // Construct the full URL by appending the bookId
    const deleteUrl = `${this.deleteBookUrl}${bookId}`;
    
    return this.http.delete(deleteUrl).pipe(
      tap(() => {
        // Update local state after successful deletion
        const currentBooks = this.booksSubject.value;
        const updatedBooks = currentBooks.filter(book => book._id !== bookId);
        this.booksSubject.next(updatedBooks);
        this.cacheData(updatedBooks);
      })
    );
  }

  getBooks(): Observable<BookModel[]> {
    // Check if we have fresh data in memory
    if (this.booksSubject.value.length > 0) {
      return this.books$;
    }

    // Check if we have cached data
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.booksSubject.next(parsedData.books);
      return this.books$;
    }

    // If no cache, fetch from API
    return this.http.get<BookModel[]>(this.booksUrl).pipe(
      tap((books: BookModel[]) => {
        const genres = [...new Set(books.map(book => book.genre))];
        this.booksSubject.next(books);
        this.cacheData(books);
        console.log('Fetched data from API:', books);
      })
    );
  }

  private loadInitialData(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.booksSubject.next(parsedData.books);
    }
  }

  private cacheData(books: BookModel[]): void {
    const dataToCache = {
      books,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(dataToCache));
  }

  // Optional: Add a method to clear cache
  clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    this.booksSubject.next([]);
  }

  // Optional: Add a method to refresh data (bypass cache)
  refreshBooks(): Observable<BookModel[]> {
    return this.http.get<BookModel[]>(this.booksUrl).pipe(
      tap((books: BookModel[]) => {
        const genres = [...new Set(books.map(book => book.genre))];
        this.booksSubject.next(books);
        this.cacheData(books);
      })
    );
  }
}