import { createElement, ensureElement, handlePrice } from '../utils/utils';
import { Component } from './base/component';
import { IEvents } from './base/events';
import { IProduct } from '../types';

interface IBasketViewState {
  items: HTMLElement[];
  total: number;
  selected: string[];
}

export class Basket extends Component<IBasketViewState> {
  protected _list: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._price = ensureElement<HTMLElement>('.basket__price', this.container);
    this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

    this._button.addEventListener('click', () => {
      this.events.emit('checkout:open-step1');
    });

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this._list.replaceChildren(...items);
      this.setDisabledButton(false);
    } else {
      this._list.replaceChildren(
        createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' })
      );
      this.setDisabledButton(true);
    }
  }

  set total(total: number) {
    this.setText(this._price, `${handlePrice(total)} синапсов`);
  }

  setDisabledButton(value: boolean) {
    this.setDisabled(this._button, value);
  }
}

export interface IBasketLineView extends IProduct {
  index: number;
}

export class BasketItem extends Component<IBasketLineView> {
  protected _index: HTMLElement;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    actions?: { onClick: (event: MouseEvent) => void }
  ) {
    super(container);
    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);

    this._button = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    this._button.addEventListener('click', (evt) => {
      this.container.remove();
      actions?.onClick(evt);
    });
  }

  set title(value: string) { this._title.textContent = value; }
  set index(value: number) { this._index.textContent = String(value); }
  set price(value: number) { this._price.textContent = `${handlePrice(value)} синапсов`; }
}
