import { IEvents } from './events';

/** Базовая модель */
export abstract class Model<T = unknown> {
  protected events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  protected emitChanges<P extends object>(event: string, payload?: P): void {
    this.events.emit(event, payload as P);
  }
}
