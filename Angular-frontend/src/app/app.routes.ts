import { Routes } from '@angular/router';
import { NewPageComponent } from './new-page/new-page.component';
import { LayoutComponent } from './layout.component';
import { Page2Component } from './page2/page2.component';
import { FooterComponent } from './footer/footer.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
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



// { path: 'new-page', component: NewPageComponent },