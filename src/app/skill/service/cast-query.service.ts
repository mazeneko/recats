import { inject, Injectable } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { extractDuplicateKeys } from '../../util/array-util';
import { CastEvent } from './cast-command.service';
import { InMemoryCastEventRepository } from './in-memory-cast-event-repository.service';

export class CastedHistory {
  constructor(
    readonly skillId: string,
    readonly castedTimes: LocalDateTime[],
  ) {}
}

export class LatestCastingSummary {
  constructor(readonly latestCastEvents: CastEvent[]) {
    const duplicateKeys = extractDuplicateKeys(
      latestCastEvents,
      (event) => event.skillId,
    );
    if (duplicateKeys.length != 0) {
      throw new Error(`Duplicate ID found: ${duplicateKeys}`);
    }
  }
  getLatestCastedTime(skillId: string): LocalDateTime | undefined {
    return this.latestCastEvents.find((event) => event.skillId === skillId)
      ?.castedAt;
  }
}

@Injectable({
  providedIn: 'root',
})
export class CastQuery {
  readonly inMemoryCastEventRepository = inject(InMemoryCastEventRepository);

  async getCastedHistory(skillId: string): Promise<CastedHistory> {
    const castedTimes = this.inMemoryCastEventRepository.events
      .filter((it) => it.skillId === skillId)
      .map((it) => it.castedAt);
    return new CastedHistory(skillId, castedTimes);
  }

  async getLatestCastingSummary(): Promise<LatestCastingSummary> {
    const groups = Map.groupBy(
      this.inMemoryCastEventRepository.events,
      (event) => event.skillId,
    );
    const latestCastEvents = Array.from(groups.values()).map((group) =>
      group.reduce((latest, current) =>
        latest.castedAt.compareTo(current.castedAt) > 0 ? latest : current,
      ),
    );
    return new LatestCastingSummary(latestCastEvents);
  }
}
