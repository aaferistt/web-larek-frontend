// Утилиты
export type Id<T extends string = string> = T;
export type Maybe<T> = T | undefined;

// Доменные типы
export interface IProductResponse {
	total: number;
	items: IProduct[];
}

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	selected: boolean;
}

export type PaymentMethod = 'card' | 'cash';

export interface IOrderForm {
	payment: PaymentMethod;
	address: string;
	phone: string;
	email: string;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}

export interface IBasketItem {
	id: string;
	title: string;
	price: number;
	count: number;
}

// DTO
export type ProductId = string;

export interface ProductDTO {
	id: ProductId;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface OrderItemDTO {
	id: ProductId;
	quantity: number;
}

export interface OrderRequestDTO {
	items: OrderItemDTO[];
	payment: PaymentMethod;
	address: string;
	email: string;
	phone: string;
}

export interface OrderResponseDTO {
	orderId: Id<'order'>;
	status: 'ok';
}

// Состояния для отображений
export interface CartState {
	items: IBasketItem[];
	total: number;
	count: number;
}

export interface OrderStateStep1 {
	payment?: PaymentMethod;
	address?: string;
	isValid: boolean;
	errors?: Partial<Record<'payment' | 'address', string>>;
}

export interface OrderStateStep2 {
	email?: string;
	phone?: string;
	isValid: boolean;
	errors?: Partial<Record<'email' | 'phone', string>>;
}

export interface OrderState {
	step: 1 | 2;
	step1: OrderStateStep1;
	step2: OrderStateStep2;
}

// API-клиент
export interface IApiClient {
	getProducts(): Promise<ProductDTO[]>;
	getProduct(id: ProductId): Promise<ProductDTO>;
	createOrder(dto: OrderRequestDTO): Promise<OrderResponseDTO>;
}
export interface IApiClientConstructor {
	new (origin: string): IApiClient;
}

// Модели
export interface ICatalogModel {
	getAll(): IProduct[];
	setAll(dto: ProductDTO[]): void;
	findById(id: ProductId): Maybe<IProduct>;
}
export interface ICatalogModelConstructor {
	new (): ICatalogModel;
}

export interface ICartModel {
	getState(): CartState;
	add(product: IProduct, qty?: number): void;
	remove(productId: ProductId): void;
	setQuantity(productId: ProductId, qty: number): void;
	clear(): void;
}
export interface ICartModelConstructor {
	new (): ICartModel;
}

export interface IOrderModel {
	getState(): OrderState;
	setPayment(method: PaymentMethod): void;
	setAddress(address: string): void;
	setEmail(email: string): void;
	setPhone(phone: string): void;
	validateStep1(): boolean;
	validateStep2(): boolean;
	toOrderRequest(cart: CartState): OrderRequestDTO;
	reset(): void;
}
export interface IOrderModelConstructor {
	new (): IOrderModel;
}

// View
export interface IView {
	render(): void;
	mount(root: HTMLElement): void;
	unmount(): void;
}
export interface IViewConstructor<TInstance extends IView = IView> {
	new (...args: unknown[]): TInstance;
}

export interface IModalView extends IView {
	open(content: HTMLElement): void;
	close(): void;
	setTitle?(title: string): void;
}
export interface IModalViewConstructor extends IViewConstructor<IModalView> {}

export interface IProductCardView extends IView {
	setData(product: IProduct): void;
}
export interface IProductCardViewConstructor
	extends IViewConstructor<IProductCardView> {}

export interface ICatalogView extends IView {
	setItems(products: IProduct[]): void;
}
export interface ICatalogViewConstructor
	extends IViewConstructor<ICatalogView> {}

export interface ICartView extends IView {
	setState(state: CartState): void;
}
export interface ICartViewConstructor extends IViewConstructor<ICartView> {}

export interface ICheckoutStep1View extends IView {
	setState(state: OrderStateStep1): void;
}
export interface ICheckoutStep1ViewConstructor
	extends IViewConstructor<ICheckoutStep1View> {}

export interface ICheckoutStep2View extends IView {
	setState(state: OrderStateStep2): void;
}
export interface ICheckoutStep2ViewConstructor
	extends IViewConstructor<ICheckoutStep2View> {}

// События и брокер
export interface AppEventMap {
	'catalog:loaded': { products: IProduct[] };
	'product:open': { productId: ProductId };
	'product:add': { productId: ProductId; quantity?: number };
	'product:remove': { productId: ProductId };
	'cart:open': void;
	'cart:changed': { state: CartState };
	'cart:cleared': void;
	'checkout:open-step1': void;
	'checkout:go-step2': void;
	'checkout:open-step2': void;
	'checkout:pay': { order: OrderRequestDTO };
	'order:step-valid': { step: 1 | 2; valid: boolean };
	'order:completed': { orderId: Id<'order'> };
	'modal:open': { content: HTMLElement; title?: string };
	'modal:close': void;
}

export interface IEventEmitter<Events = AppEventMap> {
	on<K extends keyof Events>(
		event: K,
		handler: (payload: Events[K]) => void
	): void;
	off<K extends keyof Events>(
		event: K,
		handler: (payload: Events[K]) => void
	): void;
	emit<K extends keyof Events>(event: K, payload: Events[K]): void;
}

// Presenter
export interface IAppPresenter {
	init(): Promise<void>;
}
export interface IAppPresenterConstructor {
	new (
		emitter: IEventEmitter,
		api: IApiClient,
		catalog: ICatalogModel,
		cart: ICartModel,
		order: IOrderModel,
		views: {
			modal: IModalView;
			catalog: ICatalogView;
			cart: ICartView;
			checkoutStep1: ICheckoutStep1View;
			checkoutStep2: ICheckoutStep2View;
		}
	): IAppPresenter;
}

export interface IAppData {
	catalog: IProduct[];
	basket: IProduct[];
	order: IOrder;
	formErrors: FormErrors;
	getTotalBasketPrice(): number;
	addToBasket(value: IProduct[]): void;
	deleteFromBasket(value: IProduct[]): void;
	getBasketAmount(): number;
	setProducts(items: IProduct[]): void;
	setOrderField(field: keyof IOrderForm, value: string): void;
	validateContacts(): void;
	validateOrder(): void;
	clearOrderData(): void;
}
