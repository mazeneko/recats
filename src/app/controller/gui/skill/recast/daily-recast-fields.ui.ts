import { Component, input } from '@angular/core';
import { FieldTree, FormField, schema } from '@angular/forms/signals';
import z from 'zod';

import { DevelopmentError } from '../../../../error/development-error';
import { CompletedTime, DailyRecast, IntervalDays } from '../../../../feature/skill/domain/recast';
import { zodParse, zodSafeParse } from '../../../../util/zod';
import { zodFormField, zodValidate } from '../../../../util/zod-angular';
import { FieldErrorsUi } from '../../parts/field-errors.ui';

/**
 * 日によるリキャストのフィールド
 */
@Component({
  selector: 'app-daily-recast-fields',
  imports: [FormField, FieldErrorsUi],
  template: `
    <!-- リキャスト完了時刻 -->
    <div>
      <label
        >Completed Time:<input
          type="time"
          [formField]="fields().completedTime"
          placeholder="Completed Time"
      /></label>
      <app-field-errors [fieldState]="fields().completedTime()"></app-field-errors>
    </div>
    <!-- インターバル日数 -->
    <div>
      <label
        >Interval Days:<input
          type="number"
          [formField]="fields().intervalDays"
          placeholder="Interval Days"
      /></label>
      <app-field-errors [fieldState]="fields().intervalDays()"></app-field-errors>
    </div>
  `,
  styles: ``,
})
export class DailyRecastFieldsUi {
  /** 日によるリキャストのフィールド */
  readonly fields = input.required<FieldTree<DailyRecastFields>>();
}

/** 日によるリキャストのフィールド */
export const DailyRecastFields = z
  .strictObject({
    /** リキャスト完了時刻 */
    completedTime: zodFormField.string(),
    /** インターバル日数 */
    intervalDays: zodFormField.number(),
  })
  .readonly();
export type DailyRecastFields = z.input<typeof DailyRecastFields>;

/** 日によるリキャストのフィールドのスキーマ */
export const DAILY_RECAST_FIELDS_SCHEMA = schema<DailyRecastFields>((schemaPath) => {
  zodValidate(CompletedTime, schemaPath.completedTime);
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
    completedTime: fields.completedTime,
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

/**
 * 日によるリキャストのフィールドのデフォルト値を作成します。
 * @returns 日によるリキャストのフィールドのデフォルト値
 */
export function defaultDailyRecastFields(): DailyRecastFields {
  return {
    completedTime: '',
    intervalDays: 0,
  };
}
