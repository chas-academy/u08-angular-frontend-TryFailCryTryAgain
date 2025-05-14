import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderModel } from './order-model';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersUrl = 'https://restful-api-sca9.onrender.com/order/';
  private deleteOrderUrl = 'https://restful-api-sca9.onrender.com/order/';
  private ordersSubject = new BehaviorSubject<OrderModel[]>([]);
  private readonly cacheKey = 'cachedOrders';

  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
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