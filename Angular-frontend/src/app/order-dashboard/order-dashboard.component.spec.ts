import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderDashboardComponent } from './order-dashboard.component';
import { OrderService } from '../api-calls-order.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('OrderDashboardComponent', () => {
  let component: OrderDashboardComponent;
  let fixture: ComponentFixture<OrderDashboardComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;


  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', [
      'getOrders',
      'createOrder',
      'deleteOrder',
      'refreshOrders'
    ]);

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
});