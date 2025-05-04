import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookModel } from '../book-model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  imports: [RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  
  // Will Fetch book data from the API Later, this is just used for static data atm
  Books = [
    { title: 'Book Title', price: '12.23', link: '/book/:_id'},
    { title: 'Book Title', price: '12.23', link: '/book/:_id'},
    { title: 'Book Title', price: '12.23', link: '/book/:_id'},
    { title: 'Book Title', price: '12.23', link: '/book/:_id'},
    { title: 'Book Title', price: '12.23', link: '/book/:_id'},
  ]


  displayedBooks: BookModel[]= [];

  constructor(private http: HttpClient) {
    this.getBooks();
  }

  getBooks() {
    this.http.get<BookModel[]>('https://restful-api-sca9.onrender.com/book/').subscribe((res:any) => {
      this.displayedBooks = res.slice(0, 5);
      console.log(res);
    })
  }




    // Will later be drawn from the API call, currently static data into a dynamic layout
    ShopDropDown = [
      { label: 'Fiction', link: '/shop/fiction' },
      { label: 'Non-Fiction', link: '/shop/non-fiction' },
      { label: 'Mystery & Thriller', link: '/shop/mystery-thriller' },
      { label: 'Science Fiction', link: '/shop/science-fiction' },
      { label: 'Romance', link: '/shop/romance' },
      { label: 'Biographies', link: '/shop/biographies' },
      { label: 'New Genre', link: '/shop/new-genre' },
    ];
  
    isShopDropdownOpen = false;
  
    // Function to toggle the dropdown menus
    toggleShopDropdown(): void {
      this.isShopDropdownOpen = !this.isShopDropdownOpen;
    }
  
    closeShopDropdown(): void {
      this.isShopDropdownOpen = false;
    }
}
