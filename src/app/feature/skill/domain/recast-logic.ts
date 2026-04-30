import { Duration, LocalDateTime, TemporalAdjusters } from '@js-joda/core';

import { Recast, RecastingFrom, TimeBasedRecast } from './recast';

/**
 * リキャスト完了日時を取得します。
 * @param recast リキャスト
 * @param recastingFrom リキャスト基準日時
 * @returns リキャスト完了日時
 */
export function readyAt(recast: TimeBasedRecast, recastingFrom: RecastingFrom): LocalDateTime {
  switch (recast.recastType) {
    case 'duration':
      return recastingFrom.plus(recast.recastTime);
    case 'daily': {
      const shouldRollToNextDay = recast.availableAt.isBefore(recastingFrom.toLocalTime());
      const daysToAdd = recast.intervalDays + (shouldRollToNextDay ? 1 : 0);
      return recastingFrom.plusDays(daysToAdd).with(recast.availableAt);
    }
    case 'weekly': {
      const shouldRollToNextWeek =
        recast.recastDayOfWeek.compareTo(recastingFrom.dayOfWeek()) === 0 &&
        recast.availableAt.isBefore(recastingFrom.toLocalTime());
      const weeksToAdd = recast.intervalWeeks + (shouldRollToNextWeek ? 1 : 0);
      return recastingFrom
        .plusWeeks(weeksToAdd)
        .with(TemporalAdjusters.nextOrSame(recast.recastDayOfWeek))
        .with(recast.availableAt);
    }
  }
}

/**
 * リキャスト完了までの時間を取得します。
 * @param recast リキャスト
 * @param recastingFrom リキャスト基準日時
 * @param now 現在日時
 * @returns リキャスト完了までの時間。
 */
export function untilReady(
  recast: TimeBasedRecast,
  recastingFrom: RecastingFrom,
  now: LocalDateTime,
): Duration {
  return Duration.between(now, readyAt(recast, recastingFrom));
}

/**
 * 時間経過によるリキャストであればtrueを返します。
 * @param recast リキャスト
 * @returns 時間経過によるリキャストであればtrue
 */
export function isTimeBased(recast: Recast): recast is TimeBasedRecast {
  switch (recast.recastType) {
    case 'duration':
    case 'daily':
    case 'weekly':
      return true;
    case 'manual':
      return false;
  }
}
