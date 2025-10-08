import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, of, switchMap, timer } from 'rxjs';

/**
 * 一時的な true を無視し、指定された時間（デフォルト50ms）以上 true が継続された場合のみ
 * true を返す Signal を生成します。
 *
 * - trigger Signal が true に変化したとき、delay ミリ秒間 true が継続されれば true を返します。
 * - trigger Signal が false に変化したときは、即座に false を返します。
 *
 * @param trigger - 監視対象の boolean Signal
 * @param delay - true 継続判定に使う遅延時間（ミリ秒）
 * @returns 一時的な true を除外した boolean Signal
 */
export function debouncedTrigger(trigger: Signal<boolean>, delay: number = 50): Signal<boolean> {
  return toSignal(
    toObservable(trigger).pipe(
      distinctUntilChanged(),
      switchMap((value) => (value ? timer(delay).pipe(map(() => true)) : of(false))),
      distinctUntilChanged(),
    ),
    { initialValue: trigger() },
  );
}
