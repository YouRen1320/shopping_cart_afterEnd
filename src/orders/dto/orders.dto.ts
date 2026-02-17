export class OrdersDto {
  id: number;
  date: string;
  items: CartItem[];
  totalPrice: number;
}

export class CartItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}
