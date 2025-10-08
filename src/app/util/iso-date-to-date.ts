import { Pipe, PipeTransform } from '@angular/core';

/**
 * ISOの日付文字列からDateに変換するパイプです。
 */
@Pipe({ name: 'isoDateToDate' })
export class IsoDateToDate implements PipeTransform {
  transform(value: string): Date;
  transform(value: string | null | undefined): Date | null;
  transform(value: string | null | undefined): Date | null {
    if (value == null) {
      return null;
    }
    return new Date(value);
  }
}
