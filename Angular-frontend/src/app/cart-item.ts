import { BookModel } from "./book-model";

export interface CartItem extends BookModel {
    quantity: number;
    _id: string;
}
