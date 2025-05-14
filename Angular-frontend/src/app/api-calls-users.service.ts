import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './user-model';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = 'https://restful-api-sca9.onrender.com/user/';
  private deleteUserUrl = 'https://restful-api-sca9.onrender.com/user/';
  private usersSubject = new BehaviorSubject<UserModel[]>([]);
  private readonly cacheKey = 'cachedUsers';

  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  createUser(userData: Omit<UserModel, '_id'>): Observable<UserModel> {
    return this.http.post<UserModel>(this.usersUrl, userData).pipe(
      tap(newUser => {
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next([...currentUsers, newUser]);
        this.cacheData([...currentUsers, newUser]);
      }),
      shareReplay(1)
    );
  }

  deleteUser(userId: string): Observable<any> {
    const deleteUrl = `${this.deleteUserUrl}${userId}`;
    
    return this.http.delete(deleteUrl).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.value;
        const updatedUsers = currentUsers.filter(user => user._id !== userId);
        this.usersSubject.next(updatedUsers);
        this.cacheData(updatedUsers);
      })
    );
  }

  getUsers(): Observable<UserModel[]> {
    if (this.usersSubject.value.length > 0) {
      return this.users$;
    }

    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.usersSubject.next(parsedData.users);
      return this.users$;
    }

    return this.http.get<UserModel[]>(this.usersUrl).pipe(
      tap((users: UserModel[]) => {
        this.usersSubject.next(users);
        this.cacheData(users);
      })
    );
  }

  private loadInitialData(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.usersSubject.next(parsedData.users);
    }
  }

  private cacheData(users: UserModel[]): void {
    const dataToCache = {
      users,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(dataToCache));
  }

  clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    this.usersSubject.next([]);
  }

  refreshUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.usersUrl).pipe(
      tap((users: UserModel[]) => {
        this.usersSubject.next(users);
        this.cacheData(users);
      })
    );
  }
}