import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HomepageComponent } from './homepage.component';
import { BookModel } from '../book-model';

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch books and process them correctly', fakeAsync(() => {
    const mockBooks: BookModel[] = [
      {
        _id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Classic',
        price: 12.99,
        stock: 50,
        description: 'A story of wealth and love in the 1920s',
        publishedDate: '1925-04-10'
      },
      {
        _id: '2',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Sci-Fi',
        price: 15.99,
        stock: 30,
        description: 'A science fiction masterpiece',
        publishedDate: '1965-08-01'
      },
      {
        _id: '3',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Classic',
        price: 10.99,
        stock: 45,
        description: 'A story of racial injustice in the American South',
        publishedDate: '1960-07-11'
      },
      {
        _id: '4',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasy',
        price: 14.99,
        stock: 60,
        description: 'A fantasy adventure novel',
        publishedDate: '1937-09-21'
      },
      {
        _id: '5',
        title: '1984',
        author: 'George Orwell',
        genre: 'Dystopian',
        price: 11.99,
        stock: 40,
        description: 'A dystopian social science fiction novel',
        publishedDate: '1949-06-08'
      },
      {
        _id: '6',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Classic',
        price: 9.99,
        stock: 55,
        description: 'A romantic novel of manners',
        publishedDate: '1813-01-28'
      }
    ];

    spyOn(console, 'log');

    component.getBooks();

    const req = httpMock.expectOne('https://restful-api-sca9.onrender.com/book/');
    expect(req.request.method).toBe('GET');
    req.flush(mockBooks);

    tick();

    expect(component.displayedBooks.length).toBe(5);
    expect(component.displayedBooks).toEqual(mockBooks.slice(0, 5));
    expect(component.bookGenres).toEqual(['Classic', 'Sci-Fi', 'Fantasy', 'Dystopian']);
    expect(console.log).toHaveBeenCalledWith(mockBooks);
    expect(console.log).toHaveBeenCalledWith(jasmine.arrayContaining(['Classic', 'Sci-Fi']));
  }));

  it('should handle empty response', fakeAsync(() => {
    spyOn(console, 'log');

    component.getBooks();

    const req = httpMock.expectOne('https://restful-api-sca9.onrender.com/book/');
    req.flush([]);

    tick();

    expect(component.displayedBooks).toEqual([]);
    expect(component.bookGenres).toEqual([]);
    expect(console.log).toHaveBeenCalledWith([]);
    expect(console.log).toHaveBeenCalledWith([]);
  }));
});