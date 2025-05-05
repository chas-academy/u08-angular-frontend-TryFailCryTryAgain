import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BookModel } from '../book-model';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../cart-item';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-selected-genre',
  standalone: true,
  imports: [],
  templateUrl: './selected-genre.component.html',
  styleUrls: ['./selected-genre.component.scss']
})
export class SelectedGenreComponent {
  
  private route = inject(ActivatedRoute);
  genre = signal<string>('');
  BookList: BookModel[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) {
    this.route.queryParams.subscribe(params => {
      this.genre.set(params['genre']);
      this.getBooksByGenre();
    });
  }

  getBooksByGenre() {
    const currentGenre = this.genre();
    if (!currentGenre) return;

    this.http.get<BookModel[]>(`https://restful-api-sca9.onrender.com/book/genre/${currentGenre}`)
      .subscribe({
        next: (res: BookModel[]) => this.BookList = res,
        error: (err) => console.error('Error fetching books:', err)
      });
  }

  navigateToSpecificBook(title: string) {
    this.router.navigate(['/book'], { queryParams: { title } });
  }

  addToCart(book: BookModel) {
    if (!book) return;

    const cartItem: CartItem = {
      ...book,
      quantity: 1
    };
    
    this.cartService.addToCart(cartItem);
  }

}
