import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-selected-book',
  templateUrl: './selected-book.component.html',
  styleUrl: './selected-book.component.scss'
})
export class SelectedBookComponent {

  @Input() selectedBook = {
    title: 'Book Title',
    id: 'book_id',
    genre: 'book_genre',
    price: '12.23',
    author: 'author',
    description: 'Description',
    stock: '50'
  };

  isLowStock(): boolean {
    return parseInt(this.selectedBook.stock) < 10;
  }
}
