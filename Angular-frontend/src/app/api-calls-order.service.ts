import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from './order-model';
import { UserModel } from './user-model';
import { BookModel } from './book-model';
import { shareReplay, tap } from 'rxjs/operators';
import { OrderItemModel } from './order-item-model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderUrl = 'https://restful-api-sca9.onrender.com/order/';
  private userUrl = 'https://restful-api-sca9.onrender.com/user/';
  private booksUrl = 'https://restful-api-sca9.onrender.com/book/';
  private readonly cacheKey = 'cachedOrders';
  private ordersSubject = new BehaviorSubject<OrderModel[]>([]);
  private usersSubject = new BehaviorSubject<UserModel[]>([]);
  private booksSubject = new BehaviorSubject<BookModel[]>([]);

  orders$ = this.ordersSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUsersAndBooks();
  }

  fetchOrders(): Observable<OrderModel[]> {
    if (this.ordersSubject.value.length > 0) {
      return this.orders$;
    }

    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.ordersSubject.next(parsedData.orders);
      return this.orders$;
    }

    return this.http.get<OrderModel[]>(this.orderUrl).pipe(
      tap((orders: OrderModel[]) => {
        this.ordersSubject.next(orders);
        this.cacheData(orders);
      })
    );
  }

  cacheData(orders: OrderModel[]): void {
    const dataToCache = {
      orders,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(dataToCache));
  };

  private loadUsersAndBooks(): void {
    forkJoin({
      users: this.http.get<UserModel[]>(this.userUrl),
      books: this.http.get<BookModel[]>(this.booksUrl)
    }).subscribe({
      next: ({users, books}) => {
        this.usersSubject.next(users);
        this.booksSubject.next(books);
      },
      error: (err) => console.error('Error loading users and/or books: ', err)
    });
  }

  createOrder(orderData: Omit<OrderModel, '_id'>): Observable<OrderModel> {
    return this.http.post<OrderModel>(this.orderUrl, orderData).pipe(
      tap(newOrder => {
        const currentOrders = this.ordersSubject.value;
        this.ordersSubject.next([...currentOrders, newOrder]);
        this.cacheData([...currentOrders, newOrder]);
      }),
      shareReplay(1)
    );
  }

  updateOrder(orderId: string, orderData: Omit<OrderModel, '_id'>): Observable<OrderModel> {
    return this.http.put<OrderModel>(`${this.orderUrl}/${orderId}`, orderData).pipe(
      tap(updatedOrder => {
        // Update the local state with the updated order
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = currentOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        );
        this.ordersSubject.next(updatedOrders);
        this.cacheData(updatedOrders);
      }),
      shareReplay(1)
    );
  }

  refreshOrders(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(this.orderUrl).pipe(
      tap((orders: OrderModel[]) => {
        this.ordersSubject.next(orders);
        this.cacheData(orders);
      })
    );
  }

  deleteOrder(orderId: string): Observable<any> {

    const deleteUrl = `${this.orderUrl}${orderId}`;    
    return this.http.delete(deleteUrl).pipe(
      tap(() => {
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = currentOrders.filter(order => order._id !== orderId);
        this.ordersSubject.next(updatedOrders);
        this.cacheData(updatedOrders);
      })
    );
  }
}