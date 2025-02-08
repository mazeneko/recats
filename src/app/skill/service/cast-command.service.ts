import { inject, Injectable } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { InMemoryCastEventRepository } from './in-memory-cast-event-repository.service';

export class CastEvent {
  constructor(
    readonly skillId: string,
    readonly castedAt: LocalDateTime,
  ) {}

  isDuplicated(other: CastEvent): boolean {
    return (
      this.skillId === other.skillId && this.castedAt.isEqual(other.castedAt)
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class CastCommand {
  readonly inMemoryCastEventRepository = inject(InMemoryCastEventRepository);

  async addEvent(event: CastEvent): Promise<void> {
    this.inMemoryCastEventRepository.addEvent(event);
  }

  async deleteEvent(event: CastEvent): Promise<void> {
    this.inMemoryCastEventRepository.deleteEvent(event);
  }
}
