import { Component, inject, signal } from '@angular/core';
import { UserService } from '../api-calls-users.service';
import { UserModel } from '../user-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class UserDashboardComponent {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  selectedUser = signal<UserModel | null>(null);
  createSelectedUser = signal(false);

  users = toSignal(this.userService.users$, { initialValue: [] });

  createForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: [0, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    adress: ['', Validators.required],
    ZIP: [0, Validators.required]
  });

  editForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: [0, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    adress: ['', Validators.required],
    ZIP: [0, Validators.required]
  });

  constructor() {
    this.userService.getUsers().subscribe();
  }

  onDeleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => this.refreshUsers(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  toggleCreateForm() {
    this.createSelectedUser.update(val => !val);
    if (!this.createSelectedUser()) {
      this.createForm.reset();
    }
  }

  displaySelectedUser(user: UserModel) {
    this.selectedUser.set({ ...user });
    this.editForm.patchValue({
      ...user
    });
  }

  cancelEdit() {
    this.selectedUser.set(null);
  }

  onCreateSubmit() {
    if (this.createForm.valid) {
      const formValue = this.createForm.getRawValue();
      const userData = {
        ...formValue
      };

      this.userService.createUser(userData).subscribe({
        next: () => {
          this.createForm.reset();
          this.createSelectedUser.set(false);
          this.refreshUsers();
        },
        error: (err) => console.error('Error creating user:', err)
      });
    }
  }

  onEditSubmit() {
    const selectedUser = this.selectedUser();
    if (this.editForm.valid && selectedUser) {
      const formValue = this.editForm.getRawValue();
      const updatedUser = {
        ...selectedUser,
        ...formValue
      };

      this.userService.users$.pipe(take(1)).subscribe(users => {
        const updatedUsers = users.map(user => 
          user._id === selectedUser._id ? updatedUser : user
        );
        this.userService['usersSubject'].next(updatedUsers);
      });
      
      this.selectedUser.set(null);
    }
  }

  refreshUsers() {
    this.userService.refreshUsers().subscribe({
      next: () => console.log('Users refreshed successfully'),
      error: (err) => console.error('Refresh failed:', err)
    });
  }
}