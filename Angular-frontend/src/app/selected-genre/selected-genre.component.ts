import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-selected-genre',
  imports: [RouterLink],
  templateUrl: './selected-genre.component.html',
  styleUrl: './selected-genre.component.scss'
})
export class SelectedGenreComponent {


  selectedBooks = [
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
    { title: 'Book Title', link: 'book/book_id', price: '12.23', author: 'author' },
  ]

  addToCart(e: Event): void { // Selected Book: Book
    console.log("Weird");
}

}
