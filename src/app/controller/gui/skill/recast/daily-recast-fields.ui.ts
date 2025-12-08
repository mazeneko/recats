import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree, schema } from '@angular/forms/signals';
import z from 'zod';

import { DevelopmentError } from '../../../../error/development-error';
import { AvailableAt, DailyRecast, IntervalDays } from '../../../../feature/skill/domain/recast';
import { zodParse, zodSafeParse } from '../../../../util/zod';
import { zodFormField, zodValidate } from '../../../../util/zod-angular';
import { FieldErrorsUi } from '../../parts/field-errors.ui';

/**
 * 日によるリキャストのフィールド
 */
@Component({
  selector: 'app-daily-recast-fields',
  imports: [Field, FieldErrorsUi],
  template: `
    <!-- リキャスト完了時刻 -->
    <div>
      <label
        >Available At:<input type="time" [field]="fields().availableAt" placeholder="Available At"
      /></label>
      <app-field-errors [fieldState]="fields().availableAt()"></app-field-errors>
    </div>
    <!-- インターバル日数 -->
    <div>
      <label
        >Interval Days:<input
          type="number"
          [field]="fields().intervalDays"
          placeholder="Recast (hours)"
      /></label>
      <app-field-errors [fieldState]="fields().intervalDays()"></app-field-errors>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyRecastFieldsUi {
  /** 日によるリキャストのフィールド */
  readonly fields = input.required<FieldTree<DailyRecastFields>>();
}

/** 日によるリキャストのフィールド */
export const DailyRecastFields = z
  .strictObject({
    /** リキャスト完了時刻 */
    availableAt: zodFormField.string(),
    /** インターバル日数 */
    intervalDays: zodFormField.number(),
  })
  .readonly();
export type DailyRecastFields = z.input<typeof DailyRecastFields>;

/** 日によるリキャストのフィールドのスキーマ */
export const DAILY_RECAST_FIELDS_SCHEMA = schema<DailyRecastFields>((schemaPath) => {
  zodValidate(AvailableAt, schemaPath.availableAt);
  zodValidate(IntervalDays, schemaPath.intervalDays);
});

/**
 * 日によるリキャストを作成します。
 * @param fieldsValue 日によるリキャストのフィールド
 * @returns 日によるリキャスト
 */
export function toDailyRecast(fieldsValue: DailyRecastFields): DailyRecast {
  const fields = zodParse(DailyRecastFields, fieldsValue);
  // 日によるリキャストを作成します。
  const dailyRecast = zodSafeParse(DailyRecast, {
    recastType: 'daily',
    availableAt: fields.availableAt,
    intervalDays: fields.intervalDays,
  });
  if (!dailyRecast.success) {
    throw new DevelopmentError('日によるリキャストに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue: fieldsValue,
    });
  }
  return dailyRecast.data;
}

/** 日によるリキャストのフィールドのデフォルト値 */
export const DAILY_RECAST_FIELDS_DEFAULT: DailyRecastFields = {
  availableAt: '',
  intervalDays: 0,
};
