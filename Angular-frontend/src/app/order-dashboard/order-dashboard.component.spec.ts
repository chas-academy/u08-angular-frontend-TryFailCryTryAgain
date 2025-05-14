import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderDashboardComponent } from './order-dashboard.component';
import { OrderService } from '../api-calls-order.service';
import { of } from 'rxjs';
import { OrderModel } from '../order-model';
import { ReactiveFormsModule } from '@angular/forms';

describe('OrderDashboardComponent', () => {
  let component: OrderDashboardComponent;
  let fixture: ComponentFixture<OrderDashboardComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;

  const mockOrders: OrderModel[] = [
    {
      _id: '1',
      userId: 'user1',
      bookIds: ['book1', 'book2'],
      totalAmount: 50,
      orderDate: new Date().toISOString(),
      status: 'Pending'
    },
    {
      _id: '2',
      userId: 'user2',
      bookIds: ['book3'],
      totalAmount: 30,
      orderDate: new Date().toISOString(),
      status: 'Completed'
    }
  ];

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', [
      'getOrders',
      'createOrder',
      'deleteOrder',
      'refreshOrders'
    ]);

    mockOrderService.orders$ = of(mockOrders);
    mockOrderService.getOrders.and.returnValue(of(mockOrders));
    mockOrderService.createOrder.and.returnValue(of(mockOrders[0]));
    mockOrderService.deleteOrder.and.returnValue(of({}));
    mockOrderService.refreshOrders.and.returnValue(of(mockOrders));

    await TestBed.configureTestingModule({
      imports: [OrderDashboardComponent, ReactiveFormsModule],
      providers: [
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load orders', () => {
    expect(mockOrderService.getOrders).toHaveBeenCalled();
    expect(component.orders()).toEqual(mockOrders);
  });

  it('should toggle create form', () => {
    expect(component.createSelectedOrder()).toBeFalse();
    component.toggleCreateForm();
    expect(component.createSelectedOrder()).toBeTrue();
    component.toggleCreateForm();
    expect(component.createSelectedOrder()).toBeFalse();
  });

  it('should display selected order', () => {
    const order = mockOrders[0];
    component.displaySelectedOrder(order);
    
    expect(component.selectedOrder()).toEqual(order);
    expect(component.editForm.value).toEqual({
      userId: order.userId,
      bookIds: order.bookIds.join(', '),
      totalAmount: order.totalAmount,
      orderDate: new Date(order.orderDate).toISOString().split('T')[0],
      status: order.status
    });
  });

  it('should cancel edit', () => {
    component.displaySelectedOrder(mockOrders[0]);
    expect(component.selectedOrder()).toBeTruthy();
    
    component.cancelEdit();
    expect(component.selectedOrder()).toBeNull();
  });

  it('should submit valid create form', () => {
    component.toggleCreateForm();
    const formValue = {
      userId: 'user3',
      bookIds: 'book4, book5',
      totalAmount: 40,
      orderDate: '2023-01-01',
      status: 'Pending'
    };

    component.createForm.setValue(formValue);
    component.onCreateSubmit();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith({
      ...formValue,
      orderDate: new Date(formValue.orderDate).toISOString(),
      bookIds: formValue.bookIds.split(',').map(id => id.trim())
    });
  });

  it('should not submit invalid create form', () => {
    component.toggleCreateForm();
    component.createForm.setValue({
      userId: '',
      bookIds: '',
      totalAmount: -1,
      orderDate: '',
      status: ''
    });

    component.onCreateSubmit();
    expect(mockOrderService.createOrder).not.toHaveBeenCalled();
  });

  it('should submit valid edit form', () => {
    const order = mockOrders[0];
    component.displaySelectedOrder(order);
    
    const formValue = {
      userId: 'updatedUser',
      bookIds: 'book1, book2, book3',
      totalAmount: 60,
      orderDate: '2023-01-02',
      status: 'Shipped'
    };

    component.editForm.setValue(formValue);
    component.onEditSubmit();

    expect(component.selectedOrder()).toBeNull();
  });

  it('should delete order with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteOrder('1');
    expect(mockOrderService.deleteOrder).toHaveBeenCalledWith('1');
  });

  it('should not delete order without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDeleteOrder('1');
    expect(mockOrderService.deleteOrder).not.toHaveBeenCalled();
  });

  it('should refresh orders', () => {
    component.refreshOrders();
    expect(mockOrderService.refreshOrders).toHaveBeenCalled();
  });

  it('should handle bookIds conversion in forms', () => {
    const createFormValue = {
      userId: 'user1',
      bookIds: 'book1, book2, book3',
      totalAmount: 50,
      orderDate: '2023-01-01',
      status: 'Pending'
    };
    component.createForm.setValue(createFormValue);
    
    const expectedBookIds = ['book1', 'book2', 'book3'];
    expect(component.createForm.value.bookIds).toBe('book1, book2, book3');
    
    component.displaySelectedOrder(mockOrders[0]);
    expect(component.editForm.value.bookIds).toBe('book1, book2');
  });
});