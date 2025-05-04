import { HttpClient } from '@angular/common/http';
import { Component} from '@angular/core';
import { BookModel } from '../book-model';


@Component({
  selector: 'app-new-page',
  standalone: true,
  imports: [],
  templateUrl: './new-page.component.html',
  styleUrl: './new-page.component.scss'
})

export class NewPageComponent {


  bookList: BookModel[]= [];

  displayedBooks: BookModel[]= [];

  constructor(private http: HttpClient) {
    this.getBooks();
  }

  getBooks() {
    this.http.get<BookModel[]>('https://restful-api-sca9.onrender.com/book/').subscribe((result:any) => {
      this.bookList = result;
      this.displayedBooks = result.slice(0, 5);
      console.log(result);
    })
  }

}
