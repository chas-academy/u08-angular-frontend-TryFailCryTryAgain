import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BookModel } from '../book-model';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../cart-item';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-selected-genre',
  imports: [],
  templateUrl: './selected-genre.component.html',
  styleUrl: './selected-genre.component.scss'
})
export class SelectedGenreComponent {

  private route = inject(ActivatedRoute);
  genre = signal<string>('');
  BookList: BookModel[] = [];

  constructor(private router: Router, private http: HttpClient, private cartService: CartService) {
    this.route.queryParams.subscribe(params => {
      this.genre.set(params['genre']);
    });
    this.getBooksByGenre();
  }

  getBooksByGenre() {
      const currentGenre = this.genre();
      if (!currentGenre) return;

      this.http.get<BookModel[]>(`https://restful-api-sca9.onrender.com/book/genre/${currentGenre}`).subscribe((res: BookModel[]) => {
        this.BookList = res;
        console.log(res);
        console.log(this.BookList);
      })
    }

  navigateToSpecificBook(title: string) {
    this.router.navigate(['/Book'], {
      queryParams: { title: title },
      queryParamsHandling: 'merge',
    });
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
