import { DayOfWeek, Duration, LocalDateTime, LocalTime } from '@js-joda/core';

export type Recast =
  | Recast.TimeRecast
  | Recast.DailyRecast
  | Recast.WeeklyRecast;

export namespace Recast {
  abstract class AbstractRecast {
    constructor(readonly recastType: 'time' | 'daily' | 'weekly') {}
    abstract nextRecastTiming(lastUsedAt: LocalDateTime): LocalDateTime;
    isWaiting(lastUsedAt: LocalDateTime, judgementAt: LocalDateTime): boolean {
      return judgementAt.isBefore(this.nextRecastTiming(lastUsedAt));
    }
    isCompleted(
      lastUsedAt: LocalDateTime,
      judgementAt: LocalDateTime,
    ): boolean {
      return !this.isWaiting(lastUsedAt, judgementAt);
    }
  }

  export class TimeRecast extends AbstractRecast {
    constructor(readonly recastTime: Duration) {
      super('time');
    }
    nextRecastTiming(lastUsedAt: LocalDateTime): LocalDateTime {
      return lastUsedAt.plus(this.recastTime);
    }
  }

  export class DailyRecast extends AbstractRecast {
    constructor(
      readonly recastDays: number,
      readonly availableAt: LocalTime,
    ) {
      super('daily');
    }
    nextRecastTiming(lastUsedAt: LocalDateTime): LocalDateTime {
      return lastUsedAt.plusDays(this.recastDays).with(this.availableAt);
    }
  }

  export class WeeklyRecast extends AbstractRecast {
    constructor(
      readonly recastWeeks: number,
      readonly availableAt: LocalTime,
      readonly startOfWeek: DayOfWeek,
    ) {
      super('weekly');
    }
    nextRecastTiming(lastUsedAt: LocalDateTime): LocalDateTime {
      return lastUsedAt
        .plusWeeks(this.recastWeeks)
        .with(this.startOfWeek)
        .with(this.availableAt);
    }
  }
}
