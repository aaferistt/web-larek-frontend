import { ensureElement } from '../utils/utils';
import { Component } from './base/component';
import { IEvents } from './base/events';

interface IFormState {
  valid: boolean;
  errors: string | string[];
}

export class Form<T> extends Component<IFormState> {
  protected _submit: HTMLButtonElement;
  protected _errors: HTMLElement;

  constructor(protected container: HTMLFormElement, protected events: IEvents) {
    super(container);

    this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    // Поля ввода
    this.container.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const field = target.name as keyof T;
      const value = target.value;
      this.onInputChange(field, value);
    });

    // Сабмит формы
    this.container.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      // имена форм в HTML: name="order" и name="contacts"
      this.events.emit(`${this.container.name}:submit`);
    });
  }

  protected onInputChange(field: keyof T, value: string) {
    this.events.emit('orderInput:change', { field, value });
  }

  set valid(value: boolean) {
    this._submit.disabled = !value;
  }

  set errors(value: string | string[]) {
    const msg = Array.isArray(value) ? value.join(', ') : value;
    this.setText(this._errors, msg);
  }

  render(state: Partial<T> & Partial<IFormState>) {
    const { valid, errors, ...inputs } = state ?? {};
    if (typeof valid === 'boolean') this.valid = valid;
    if (typeof errors !== 'undefined') this.errors = errors!;
    // прокинуть значения инпутов через сеттеры дочерних форм
    Object.assign(this as object, inputs);
    return this.container;
  }
}
