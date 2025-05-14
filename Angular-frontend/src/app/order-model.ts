export interface OrderModel {
    _id: string,
  userId: string;
  bookIds: string[];
  totalAmount: number;
  orderDate: string;
  status: string;
}



