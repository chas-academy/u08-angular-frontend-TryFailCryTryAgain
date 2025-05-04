import { Routes } from '@angular/router';
import { NewPageComponent } from './new-page/new-page.component';
import { LayoutComponent } from './layout.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ContactComponent } from './contact/contact.component';
import { SelectedGenreComponent } from './selected-genre/selected-genre.component';
import { SelectedBookComponent } from './selected-book/selected-book.component';
import { CheckoutComponent } from './checkout/checkout.component';


// Localhost:4200/contact

export const routes: Routes = [
    {
        path: 'test',
        component: LayoutComponent,
        children: [
            { path: '', component: NewPageComponent },
        ],
    },
    {
        path: 'checkout',
        component: LayoutComponent,
        children: [
            { path: '', component: CheckoutComponent },
        ],
    },
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
];