import { Duration, LocalDateTime } from '@js-joda/core';

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
    case 'daily':
      return recastingFrom.plusDays(recast.recastDays).with(recast.availableAt);
    case 'weekly':
      return recastingFrom
        .plusWeeks(recast.recastWeeks)
        .with(recast.recastDayOfWeek)
        .with(recast.availableAt);
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
