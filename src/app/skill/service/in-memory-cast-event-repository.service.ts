import { Injectable } from '@angular/core';

import { CastEvent } from './cast-command.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryCastEventRepository {
  readonly events: CastEvent[] = [];

  addEvent(event: CastEvent): CastEvent {
    if (this.events.some((it) => it.isDuplicated(event))) {
      throw new Error(`duplicated time ${event.skillId} ${event.castedAt}`);
    }
    this.events.push(event);
    return event;
  }

  deleteEvent(event: CastEvent): boolean {
    const index = this.events.findIndex((it) => it.isDuplicated(event));
    if (index === -1) {
      return false;
    }
    this.events.splice(index, 1);
    return true;
  }
}
