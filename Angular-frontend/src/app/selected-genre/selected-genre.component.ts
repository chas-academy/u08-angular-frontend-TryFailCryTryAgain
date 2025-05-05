import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BookModel } from '../book-model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-selected-genre',
  imports: [RouterLink],
  templateUrl: './selected-genre.component.html',
  styleUrl: './selected-genre.component.scss'
})
export class SelectedGenreComponent {

  private route = inject(ActivatedRoute);
  genre = signal<string>('');

  constructor(private http: HttpClient) {
    this.route.queryParams.subscribe(params => {
      this.genre.set(params['genre']);
    });
    this.getBooksByGenre();
  }

  BookList: any[]= [];

  getBooksByGenre() {
      const currentGenre = this.genre();
      if (!currentGenre) return;

      this.http.get<BookModel[]>(`https://restful-api-sca9.onrender.com/book/genre/${currentGenre}`).subscribe((res:any) => {
        this.BookList = res;
        console.log(res);
        console.log(this.BookList);
      })
    }

  addToCart(e: Event): void { // Selected Book: Book
    console.log("Weird");
}

}
