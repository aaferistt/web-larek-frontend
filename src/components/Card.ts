// src/components/Card.ts
import { Component } from './base/component';
import { ensureElement, handlePrice } from '../utils/utils';
import { CDN_URL } from '../utils/constants';
import { IProduct } from '../types';

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
  protected _category: HTMLElement; // .cardcategory
  protected _image?: HTMLImageElement;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button?: HTMLButtonElement;

  protected _categoryColor: Record<string, string> = {
    'софт-скил': 'soft',
    'другое': 'other',
    'дополнительное': 'additional',
    'кнопка': 'button',
    'хард-скил': 'hard',
  };

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._image = ensureElement<HTMLImageElement>('.card__image', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._category = ensureElement<HTMLElement>('.cardcategory', container);

    // В превью есть .card__button, а в каталоге сам контейнер — <button>
    const explicitButton = container.querySelector<HTMLButtonElement>('.card__button');
    const containerIsButton =
      container.tagName === 'BUTTON' ? (container as HTMLButtonElement) : undefined;

    this._button = explicitButton ?? containerIsButton;

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }
  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }
  get title(): string {
    return this._title.textContent || '';
  }

  set price(value: number | null) {
    this._price.textContent =
      value !== null ? `${handlePrice(value)} синапсов` : 'Бесценно';

    // Блокируем только настоящую кнопку «Купить» из превью
    if (this._button && this._button.classList.contains('card__button')) {
      this._button.disabled = value === null;
    }
  }

  set category(value: string) {
    this.setText(this._category, value);
    const mod = this._categoryColor[value] ?? 'other';
    this._category.className = `cardcategory cardcategory_${mod}`;
  }

  set image(value: string) {
    this.setImage(this._image!, CDN_URL + value, this.title);
  }

  set selected(value: boolean) {
    if (this._button && this._button.classList.contains('card__button')) {
      this.setText(this._button, value ? 'Удалить из корзины' : 'Купить');
    }
  }
}

export class CardPreview extends Card {
  protected _description: HTMLElement;
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);
    this._description = ensureElement<HTMLElement>('.card__text', container);
  }
  set description(value: string) {
    this._description.textContent = value;
  }
}
