type EventName = string | RegExp | '*';
type Subscriber = (payload?: unknown) => void;

export interface IEvents {
  on(event: EventName, callback: Subscriber): void;
  off(event: EventName, callback: Subscriber): void;
  emit(event: string, payload?: unknown): void;
  onAll(callback: (e: { eventName: string; data: unknown }) => void): void;
  offAll(): void;

  trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

/**
 * Классический брокер событий
 */
export class EventEmitter implements IEvents {
  private _events = new Map<EventName, Set<Subscriber>>();

  on(event: EventName, callback: Subscriber): void {
    if (!this._events.has(event)) {
      this._events.set(event, new Set<Subscriber>());
    }
    this._events.get(event)!.add(callback);
  }

  off(event: EventName, callback: Subscriber): void {
    if (!this._events.has(event)) return;
    this._events.get(event)!.delete(callback);
    if (this._events.get(event)!.size === 0) {
      this._events.delete(event);
    }
  }

  emit(eventName: string, payload?: unknown): void {
    this._events.forEach((subscribers, name) => {
      // слушатели "всех событий"
      if (name === '*') {
        subscribers.forEach(cb => cb({ eventName, data: payload }));
      }
      if ((name instanceof RegExp && name.test(eventName)) || name === eventName) {
        subscribers.forEach(cb => cb(payload));
      }
    });
  }

  onAll(callback: (e: { eventName: string; data: unknown }) => void): void {
    this.on('*', callback as Subscriber);
  }

  offAll(): void {
    this._events.clear();
  }

  trigger<T extends object>(eventName: string, context?: Partial<T>) {
    return (event: object = {}) => {
      this.emit(eventName, { ...(event || {}), ...(context || {}) });
    };
  }
}
