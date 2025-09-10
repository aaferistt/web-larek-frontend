import { Form } from './Form';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

export interface IOrder {
  address: string;
  payment?: 'card' | 'cash';
}

export class Order extends Form<IOrder> {
  protected _card: HTMLButtonElement;
  protected _cash: HTMLButtonElement;
  protected _address: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    // Берём элементы безопасно
    this._card = ensureElement<HTMLButtonElement>('[name="card"]', container);
    this._cash = ensureElement<HTMLButtonElement>('[name="cash"]', container);
    this._address = ensureElement<HTMLInputElement>('input[name="address"]', container);

    // Тогглим активную кнопку и шлём изменение payment
    this._cash.addEventListener('click', () => {
      this._cash.classList.add('button_alt-active');
      this._card.classList.remove('button_alt-active');
      this.onInputChange('payment', 'cash');
    });

    this._card.addEventListener('click', () => {
      this._card.classList.add('button_alt-active');
      this._cash.classList.remove('button_alt-active');
      this.onInputChange('payment', 'card');
    });

    // Передаём изменение адреса наверх через базовый onInputChange
    this._address.addEventListener('input', () => {
      this.onInputChange('address', this._address.value);
    });
  }

  // Сброс активных стилей у кнопок
  disableButtons() {
    this._cash.classList.remove('button_alt-active');
    this._card.classList.remove('button_alt-active');
  }

  set payment(value: 'card' | 'cash' | undefined) {
    if (value === 'cash') {
      this._cash.classList.add('button_alt-active');
      this._card.classList.remove('button_alt-active');
    } else if (value === 'card') {
      this._card.classList.add('button_alt-active');
      this._cash.classList.remove('button_alt-active');
    } else {
      this.disableButtons();
    }
  }

  set address(value: string) {
    this._address.value = value ?? '';
  }
}
