import { Routes } from '@angular/router';
import { NewPageComponent } from './new-page/new-page.component';
import { LayoutComponent } from './layout.component';
import { Page2Component } from './page2/page2.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ContactComponent } from './contact/contact.component';
import { SelectedGenreComponent } from './selected-genre/selected-genre.component';
import { SelectedBookComponent } from './selected-book/selected-book.component';


// Localhost:4200/contact

export const routes: Routes = [
    {
        path: 'book/book_id',
        component: LayoutComponent,
        children: [
            { path: '', component: SelectedBookComponent },
        ],
    },
    {
        path: 'book/fiction',
        component: LayoutComponent,
        children: [
            { path: '', component: SelectedGenreComponent },
        ],
    },
    {
        path: 'contact2',
        component: ContactComponent,
    },
    {
        path: 'contact',
        component: LayoutComponent,
        children: [
            { path: '', component: ContactComponent },
        ],
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: HomepageComponent },
        ],
    },
    {
        path: 'new-page',
        component: LayoutComponent,
        children: [
            { path: '', component: NewPageComponent },
        ],
    },
    {
        path: 'page2',
        component: LayoutComponent,
        children: [
            { path: '', component: Page2Component },
        ],
    },
];