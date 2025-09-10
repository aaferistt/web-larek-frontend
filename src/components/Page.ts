import { Component } from './base/component';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

interface IPage {
  gallery: HTMLElement[];
  counter: number;
  locked: boolean;
}

export class Page extends Component<IPage> {
  protected _gallery: HTMLElement;
  protected _wrapper: HTMLElement;
  protected _counter: HTMLElement;
  protected _basket: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    // Берём элементы из DOM
    this._gallery = ensureElement<HTMLElement>('.gallery');
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
    this._counter = ensureElement<HTMLElement>('.header__basket-counter');
    this._basket = ensureElement<HTMLElement>('.header__basket');

    // Открытие корзины
    this._basket.addEventListener('click', () => {
      this.events.emit('cart:open');

    });
  }

  // Счётчик товаров в шапке
  set counter(value: number) {
    this.setText(this._counter, String(value));
  }

  // Рендер списка карточек на главной
  set galery(items: HTMLElement[]) {
    this._gallery.replaceChildren(...items);
  }

  // Блокировка прокрутки страницы под модалкой
  set locked(value: boolean) {
    if (value) {
      this._wrapper.classList.add('page__wrapper_locked');
    } else {
      this._wrapper.classList.remove('page__wrapper_locked');
    }
  }
}
