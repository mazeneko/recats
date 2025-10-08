import { InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalDateTime } from '@js-joda/core';
import { interval, map } from 'rxjs';

/**
 * 現在日時のInjectionToken
 */
export const CURRENT_DATE_TIME = new InjectionToken<Signal<LocalDateTime>>('current.date.time');
/**
 * 現在日時のSignalを提供します。
 * {@link CURRENT_DATE_TIME}でInjectionできます。
 * @param intervalPeriod Signalの更新間隔。関数内で{@link interval}に使われます。デフォルトは1000ms。
 */
export function provideCurrentDateTime(intervalPeriod: number = 1000): Provider {
  return {
    provide: CURRENT_DATE_TIME,
    useFactory: () =>
      toSignal(
        interval(intervalPeriod).pipe(map((_) => LocalDateTime.now())), //
        { initialValue: LocalDateTime.now() },
      ),
  };
}
