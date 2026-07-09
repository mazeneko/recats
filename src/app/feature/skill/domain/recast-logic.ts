import { Duration, LocalDateTime, TemporalAdjusters } from '@js-joda/core';

import { zodParse } from '../../../util/zod';
import { CompletedAt, Recast, RecastFrom, TimeBasedRecast } from './recast';

/**
 * リキャスト完了日時を取得します。
 * @param recast リキャスト
 * @param recastFrom リキャスト基準日時
 * @returns リキャスト完了日時
 */
export function completedAt(recast: TimeBasedRecast, recastFrom: RecastFrom): CompletedAt {
  switch (recast.recastType) {
    case 'duration':
      const completedAt = recastFrom.plus(recast.recastDuration);
      return zodParse(CompletedAt, completedAt);
    case 'daily': {
      const shouldRollToNextDay = recast.completedTime.compareTo(recastFrom.toLocalTime()) <= 0;
      const daysToAdd = recast.intervalDays + (shouldRollToNextDay ? 1 : 0);
      const completedAt = recastFrom.plusDays(daysToAdd).with(recast.completedTime);
      return zodParse(CompletedAt, completedAt);
    }
    case 'weekly': {
      const shouldRollToNextWeek =
        recast.completedDayOfWeek.compareTo(recastFrom.dayOfWeek()) === 0 &&
        recast.completedTime.compareTo(recastFrom.toLocalTime()) <= 0;
      const weeksToAdd = recast.intervalWeeks + (shouldRollToNextWeek ? 1 : 0);
      const completedAt = recastFrom
        .plusWeeks(weeksToAdd)
        .with(TemporalAdjusters.nextOrSame(recast.completedDayOfWeek))
        .with(recast.completedTime);
      return zodParse(CompletedAt, completedAt);
    }
  }
}

/**
 * リキャスト完了までの時間を取得します。
 * @param recast リキャスト
 * @param recastFrom リキャスト基準日時
 * @param now 現在日時
 * @returns リキャスト完了までの時間。
 */
export function untilComplete(
  recast: TimeBasedRecast,
  recastFrom: RecastFrom,
  now: LocalDateTime,
): Duration {
  return Duration.between(now, completedAt(recast, recastFrom));
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
