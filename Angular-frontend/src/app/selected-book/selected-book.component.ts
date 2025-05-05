import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BookModel } from '../book-model';
import { CartService } from '../cart.service';
import { CartItem } from '../cart-item';

@Component({
  selector: 'app-selected-book',
  templateUrl: './selected-book.component.html',
  styleUrl: './selected-book.component.scss'
})
export class SelectedBookComponent {
  private route = inject(ActivatedRoute);
  title = signal<string>('');

  constructor(private router: Router, private http: HttpClient, private cartService: CartService) {
    this.route.queryParams.subscribe(params => {
      this.title.set(params['title']);
    });
    this.getBookByTitle();
  }

  BookDetails: BookModel | null = null;
  IdBookDetails: BookModel | null = null;

  getBookByTitle() {
    const currentTitle = this.title();
    if (!currentTitle) return;

    this.http.get<BookModel>(`https://restful-api-sca9.onrender.com/book/${currentTitle}`).subscribe((res: BookModel) => {
      this.BookDetails = res;
    });
  }

  getBookById(_id: any) {
    const currentId = _id;
    this.http.get<BookModel>(`https://restful-api-sca9.onrender.com/book/id/${currentId}`).subscribe((res: BookModel) => {
      this.IdBookDetails = res;
    });
  }

  addToCart() {
    if (!this.BookDetails) return;
    
    // Convert BookModel to CartItem
    const cartItem: CartItem = {
      ...this.BookDetails,
      quantity: 1  // Default quantity when adding to cart
    };
    
    this.cartService.addToCart(cartItem);
  }
}