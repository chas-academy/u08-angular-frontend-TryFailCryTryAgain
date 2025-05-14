import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ContactComponent } from './contact/contact.component';
import { SelectedGenreComponent } from './selected-genre/selected-genre.component';
import { SelectedBookComponent } from './selected-book/selected-book.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AdminComponent } from './admin/admin.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { BookDashboardComponent } from './book-dashboard/book-dashboard.component';
import { ReviewDashboardComponent } from './review-dashboard/review-dashboard.component';
import { OrderDashboardComponent } from './order-dashboard/order-dashboard.component';

export const routes: Routes = [
    {
        path: 'admin',
        component: LayoutComponent,
        children: [
            {
                path: '',
                component: AdminComponent,
                children: [
                    { path: 'users', component: UserDashboardComponent },
                    { path: 'books', component: BookDashboardComponent },
                    { path: 'reviews', component: ReviewDashboardComponent },
                    { path: 'orders', component: OrderDashboardComponent }
                ]
            }
        ]
    },
    {
        path: 'checkout',
        component: LayoutComponent,
        children: [
            { path: '', component: CheckoutComponent },
        ],
    },
    {
        path: 'book',
        component: LayoutComponent,
        children: [
            { path: '', component: SelectedBookComponent },
        ],
    },
    {
        path: 'Genre',
        component: LayoutComponent,
        children: [
            { path: '', component: SelectedGenreComponent },
        ],
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
];