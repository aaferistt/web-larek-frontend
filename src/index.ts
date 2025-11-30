// src/index.ts
import './scss/styles.scss';

import { Api } from './components/base/api';
import { AppData } from './components/AppData';
import { EventEmitter } from './components/base/events';

import { Card, CardPreview } from './components/Card';
import { Basket, BasketItem } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contact';
import { Success } from './components/Success';
import { Page } from './components/Page';
import { Modal } from './components/Modal';

import { ensureElement, cloneTemplate } from './utils/utils';
import { IOrderForm, IProduct, IProductResponse, OrderRequestDTO } from './types';
import { API_URL } from './utils/constants';

// ---- core singletons
const api = new Api(API_URL);
const events = new EventEmitter();
const page = new Page(document.body, events);
const appData = new AppData(events);

// ---- templates & widgets
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const tplCardCatalog = ensureElement<HTMLTemplateElement>('#card-catalog');
const tplCardPreview = ensureElement<HTMLTemplateElement>('#card-preview');
const tplBasket = ensureElement<HTMLTemplateElement>('#basket');
const tplBasketItem = ensureElement<HTMLTemplateElement>('#card-basket');
const tplOrder = ensureElement<HTMLTemplateElement>('#order');
const tplContacts = ensureElement<HTMLTemplateElement>('#contacts');
const tplSuccess = ensureElement<HTMLTemplateElement>('#success');

const basketView = new Basket(cloneTemplate(tplBasket), events);
const orderView = new Order(cloneTemplate(tplOrder), events);
const contactsView = new Contacts(cloneTemplate(tplContacts), events);
const successView = new Success(cloneTemplate(tplSuccess), {
  onClick: () => {
    events.emit('modal:close');
    modal.close();
  },
});

// ===== helpers

function openPreview(item: IProduct) {
  const preview = new CardPreview(cloneTemplate(tplCardPreview), {
    onClick: () =>
      events.emit(item.selected ? 'product:remove' : 'product:add', {
        productId: item.id,
      }),
  });

  modal.render({
    content: preview.render({
      id: item.id,
      title: item.title,
      image: item.image,
      category: item.category,
      description: item.description,
      price: item.price,
      selected: item.selected,
    }),
  });
}

function renderBasketList() {
  const items = appData.basket.map((item, index) => {
    const view = new BasketItem(cloneTemplate(tplBasketItem), {
      onClick: () => events.emit('product:remove', { productId: item.id }),
    });
    return view.render({
      title: item.title,
      price: item.price ?? 0,
      index: index + 1,
      id: item.id,
      image: item.image,
      category: item.category,
      description: item.description,
      selected: item.selected,
    });
  });

  basketView.items = items;
  basketView.total = appData.getTotalBasketPrice();
}

// ===== bootstrap data + диагностика
events.onAll((e) => console.log('[event]', e));

api
  .get('/product')
  .then((res: IProductResponse) => {
    console.log('[api]/product ok:', res);
    const items = Array.isArray(res?.items) ? res.items : [];
    if (!items.length) {
      console.warn('[api] пусто — рендерю моки');
      const mocks: IProduct[] = [
        {
          id: 'm1',
          title: 'Моковый товар 1',
          description: 'Описание 1',
          image: '/images/Subtract.svg',
          category: 'другое',
          price: 750,
          selected: false,
        },
        {
          id: 'm2',
          title: 'Моковый товар 2',
          description: 'Описание 2',
          image: '/images/Subtract.svg',
          category: 'софт-скил',
          price: 1000,
          selected: false,
        },
        {
          id: 'm3',
          title: 'Моковый товар 3',
          description: 'Описание 3',
          image: '/images/Subtract.svg',
          category: 'хард-скил',
          price: null,
          selected: false,
        },
      ];
      appData.setProducts(mocks);
      console.log('AppData catalog length:', appData.catalog.length);
    } else {
      appData.setProducts(items);
      console.log('AppData catalog length:', appData.catalog.length);
    }
  })
  .catch((err) => {
    console.error('[api]/product error:', err);
    const mocks: IProduct[] = [
      {
        id: 'm1',
        title: 'Моковый товар 1',
        description: 'Описание 1',
        image: '/images/Subtract.svg',
        category: 'другое',
        price: 750,
        selected: false,
      },
      {
        id: 'm2',
        title: 'Моковый товар 2',
        description: 'Описание 2',
        image: '/images/Subtract.svg',
        category: 'софт-скил',
        price: 1000,
        selected: false,
      },
    ];
    appData.setProducts(mocks);
    console.log('AppData catalog length:', appData.catalog.length);
  });

// ===== Events wiring

// каталог загружен -> рисуем карточки
events.on('catalog:loaded', (data: { products: IProduct[] }) => {
  page.gallery = data.products.map((item) => {
    const card = new Card(cloneTemplate(tplCardCatalog), {
      onClick: () => events.emit('product:open', { productId: item.id }),
    });
    return card.render({
      id: item.id,
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
      selected: item.selected,
      description: item.description,
    });
  });
});

// открыть карточку товара
events.on('product:open', ({ productId }: { productId: string }) => {
  const item = appData.catalog.find((p) => p.id === productId);
  if (item) openPreview(item);
});

// добавить в корзину
events.on('product:add', ({ productId }: { productId: string }) => {
  console.log('📥 product:add вызван с productId =', productId, typeof productId);
  
  const catalogIds = appData.catalog.map(p => ({ id: p.id, type: typeof p.id }));
  console.log('📋 Все ID в каталоге:', catalogIds);

  const item = appData.catalog.find((p) => p.id === productId);
  console.log('🔍 Найден товар?', item);

  if (!item) {
    console.warn('⚠️ Товар НЕ НАЙДЕН в каталоге по ID:', productId);
    return;
  }

  item.selected = true;
  appData.addToBasket([item]);
  page.counter = appData.getBasketAmount();
  openPreview(item);
});

// удалить из корзины
events.on('product:remove', ({ productId }: { productId: string }) => {
  const item = appData.catalog.find((p) => p.id === productId);
  if (!item) return;
  item.selected = false;
  appData.deleteFromBasket([item]);
  page.counter = appData.getBasketAmount();
  openPreview(item);
});

// открыть корзину
events.on('cart:open', () => {
  renderBasketList();
  modal.render({
  content: basketView.render({
    total: appData.getTotalBasketPrice(),
  }),
});
});

// состояние корзины изменилось
events.on('cart:changed', () => {
  renderBasketList();
});

// шаг 1 заказа
events.on('checkout:open-step1', () => {
  modal.render({
    content: orderView.render({
      address: '',
      valid: false,
      errors: [],
    }),
  });
});

// валидация шагов
events.on('order:step-valid', ({ step, valid }: { step: 1 | 2; valid: boolean }) => {
  if (step === 1) orderView.valid = valid;
  if (step === 2) contactsView.valid = valid;
});

// изменения полей форм
events.on(
  'orderInput:change',
  ({ field, value }: { field: keyof IOrderForm; value: string }) => {
    appData.setOrderField(field, value);
  }
);

// сабмит шага 1 -> контакты
events.on('order:submit', () => {
  modal.render({
    content: contactsView.render({
      valid: false,
      errors: [],
    }),
  });
});

// сабмит шага 2 -> отправка заказа
events.on('contacts:submit', () => {
  const dto: OrderRequestDTO = appData.toOrderRequest();
  api
    .post('/order', dto)
    .then((res: { orderId: string; total?: number }) => {
      events.emit('order:completed', { orderId: res.orderId });
      modal.render({
        content: successView.render({
          total: appData.getTotalBasketPrice(),
        }),
      });
      appData.clearOrderData();
      orderView.disableButtons?.();
      page.counter = 0;
    })
    .catch(console.error);
});

// модалка: блокировка страницы
events.on('modal:open', () => (page.locked = true));
events.on('modal:close', () => (page.locked = false));
