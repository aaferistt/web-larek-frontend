import { ensureElement } from '../utils/utils';
import { Component } from './base/component';
import { IEvents } from './base/events';

interface IModalData {
  content: HTMLElement;
  title?: string;
}

export class Modal extends Component<IModalData> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this._content = ensureElement<HTMLElement>('.modal__content', container);

    // закрыть по крестику
    this._closeButton.addEventListener('click', this.close.bind(this));
    // закрыть по клику на оверлей
    this.container.addEventListener('click', this.close.bind(this));
    // не всплывать кликам внутри контента
    this._content.addEventListener('click', (event) => event.stopPropagation());
  }

  set content(value: HTMLElement | null) {
    if (value) {
      this._content.replaceChildren(value);
    } else {
      this._content.replaceChildren();
    }
  }

  /** Открыть модалку с контентом */
  open(content: HTMLElement, title?: string) {
    this.content = content;
    this.container.classList.add('modal_active');
    this.events.emit('modal:open', { content, title } as any);
  }

  /** Закрыть модалку */
  close() {
    this.container.classList.remove('modal_active');
    this.content = null;
    this.events.emit('modal:close');
  }

  render(data: IModalData): HTMLElement {
    super.render(data);
    this.open(data.content, data.title);
    return this.container;
  }
}
