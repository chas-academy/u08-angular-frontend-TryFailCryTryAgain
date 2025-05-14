import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountService {
  private readonly STORAGE_KEY = 'countItems';
  private _countItems$ = new BehaviorSubject<number>(0);

  public countItems$: Observable<number> = this._countItems$.pipe(
    distinctUntilChanged()
  );

  constructor() {
    const savedCount = localStorage.getItem(this.STORAGE_KEY);
    if (savedCount) {
      this._countItems$.next(Number(savedCount));
    }
  }

  addNumber() {
    const newCount = this._countItems$.value + 1;
    this._countItems$.next(newCount);
    
    localStorage.setItem(this.STORAGE_KEY, newCount.toString());
  }

  subtractNumber() {
    const newCount = this._countItems$.value - 1;
    this._countItems$.next(newCount);

    localStorage.setItem(this.STORAGE_KEY, newCount.toString());
  }
}
