import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from './order-model';
import { UserModel } from './user-model';
import { BookModel } from './book-model';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersUrl = 'https://restful-api-sca9.onrender.com/order/';
  private usersUrl = 'https://restful-api-sca9.onrender.com/user/';
  private booksUrl = 'https://restful-api-sca9.onrender.com/book/';
  private deleteOrderUrl = 'https://restful-api-sca9.onrender.com/order/';
  private ordersSubject = new BehaviorSubject<OrderModel[]>([]);
  private usersSubject = new BehaviorSubject<UserModel[]>([]);
  private booksSubject = new BehaviorSubject<BookModel[]>([]);
  private readonly cacheKey = 'cachedOrders';

  orders$ = this.ordersSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
    this.loadUsersAndBooks();
  }

  private loadUsersAndBooks(): void {
    forkJoin({
      users: this.http.get<UserModel[]>(this.usersUrl),
      books: this.http.get<BookModel[]>(this.booksUrl)
    }).subscribe({
      next: ({users, books}) => {
        this.usersSubject.next(users);
        this.booksSubject.next(books);
      },
      error: (err) => console.error('Error loading users or books:', err)
    });
  }

  createOrder(orderData: Omit<OrderModel, '_id'>): Observable<OrderModel> {
    return this.http.post<OrderModel>(this.ordersUrl, orderData).pipe(
      tap(newOrder => {
        const currentOrders = this.ordersSubject.value;
        this.ordersSubject.next([...currentOrders, newOrder]);
        this.cacheData([...currentOrders, newOrder]);
      }),
      shareReplay(1)
    );
  }

  deleteOrder(orderId: string): Observable<any> {
    const deleteUrl = `${this.deleteOrderUrl}${orderId}`;
    
    return this.http.delete(deleteUrl).pipe(
      tap(() => {
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = currentOrders.filter(order => order._id !== orderId);
        this.ordersSubject.next(updatedOrders);
        this.cacheData(updatedOrders);
      })
    );
  }

  getOrders(): Observable<OrderModel[]> {
    if (this.ordersSubject.value.length > 0) {
      return this.orders$;
    }

    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.ordersSubject.next(parsedData.orders);
      return this.orders$;
    }

    return this.http.get<OrderModel[]>(this.ordersUrl).pipe(
      tap((orders: OrderModel[]) => {
        this.ordersSubject.next(orders);
        this.cacheData(orders);
      })
    );
  }

  private loadInitialData(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.ordersSubject.next(parsedData.orders);
    }
  }

  private cacheData(orders: OrderModel[]): void {
    const dataToCache = {
      orders,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(dataToCache));
  }

  clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    this.ordersSubject.next([]);
  }

  refreshOrders(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(this.ordersUrl).pipe(
      tap((orders: OrderModel[]) => {
        this.ordersSubject.next(orders);
        this.cacheData(orders);
      })
    );
  }
}