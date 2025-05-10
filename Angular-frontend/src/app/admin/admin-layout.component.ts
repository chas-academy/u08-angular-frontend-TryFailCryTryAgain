import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminheaderComponent } from '../adminheader/adminheader.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, AdminheaderComponent, CommonModule],
    template: `
    <div class="admin-layout">
        <app-adminheader></app-adminheader>
        <div class="admin-content">
            <router-outlet></router-outlet>  <!-- This will render AdminComponent -->
        </div>
    </div>
    `,
    styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .admin-content {
        padding: 20px;
        flex-grow: 1;
    }
    `]

})
export class AdminLayoutComponent {}