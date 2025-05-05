import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookModel } from '../book-model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  imports: [RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  
  displayedBooks: BookModel[]= [];

  bookGenres: any[]= [];

  constructor(private router: Router, private http: HttpClient) {
    this.getBooks();
  }

  getBooks() {
    this.http.get<BookModel[]>('https://restful-api-sca9.onrender.com/book/').subscribe((res:any) => {
      this.displayedBooks = res.slice(0, 5);
      this.bookGenres = [...new Set(res.map((book: BookModel) => book.genre))];
      console.log(res);
      console.log(this.bookGenres);
    })
  }

  navigateToGenre(genre: string) {
    this.closeShopDropdown();
    this.router.navigate(['/Genre'], {
      queryParams: { genre: genre },
      queryParamsHandling: 'merge',
      onSameUrlNavigation: 'reload'
    }).then(() => {
      window.location.reload();
    });
  }
  
  isShopDropdownOpen = false;

  // Function to toggle the dropdown menus
  toggleShopDropdown(): void {
    this.isShopDropdownOpen = !this.isShopDropdownOpen;
  }

  closeShopDropdown(): void {
    this.isShopDropdownOpen = false;
  }
}
