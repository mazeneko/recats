import { Component, input } from '@angular/core';
import { FieldTree, FormField, schema } from '@angular/forms/signals';
import z from 'zod';
import { DevelopmentError } from '../../../../error/development-error';
import {
  CompletedDayOfWeek,
  CompletedTime,
  IntervalWeeks,
  WeeklyRecast,
} from '../../../../feature/skill/domain/recast';
import { zodParse, zodSafeParse } from '../../../../util/zod';
import { zodFormField, zodValidate } from '../../../../util/zod-angular';
import { ZodDayOfWeekEnum } from '../../../../util/zod-joda';
import { FieldErrorsUi } from '../../parts/field-errors.ui';

/**
 * 週によるリキャストのフィールド
 */
@Component({
  selector: 'app-weekly-recast-fields',
  imports: [FormField, FieldErrorsUi],
  template: `
    <!-- リキャスト完了曜日 -->
    <div>
      <select [formField]="fields().completedDayOfWeek">
        @for (dayOfWeek of ZodDayOfWeekEnum.options; track $index) {
          <option [value]="dayOfWeek">{{ dayOfWeek }}</option>
        }
      </select>
      <app-field-errors [fieldState]="fields().completedDayOfWeek()"></app-field-errors>
    </div>
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
    <!-- インターバル週数 -->
    <div>
      <label
        >Interval Weeks:<input
          type="number"
          [formField]="fields().intervalWeeks"
          placeholder="Interval Weeks"
      /></label>
      <app-field-errors [fieldState]="fields().intervalWeeks()"></app-field-errors>
    </div>
  `,
  styles: ``,
})
export class WeeklyRecastFieldsUi {
  /** 週によるリキャストのフィールド */
  readonly fields = input.required<FieldTree<WeeklyRecastFields>>();
  /** 曜日 */
  readonly ZodDayOfWeekEnum = ZodDayOfWeekEnum;
}

/** 週によるリキャストのフィールド */
export const WeeklyRecastFields = z
  .strictObject({
    /** リキャスト完了曜日 */
    completedDayOfWeek: zodFormField.string(),
    /** リキャスト完了時刻 */
    completedTime: zodFormField.string(),
    /** インターバル週数 */
    intervalWeeks: zodFormField.number(),
  })
  .readonly();
export type WeeklyRecastFields = z.input<typeof WeeklyRecastFields>;

/** 週によるリキャストのフィールドのスキーマ */
export const WEEKLY_RECAST_FIELDS_SCHEMA = schema<WeeklyRecastFields>((schemaPath) => {
  zodValidate(CompletedDayOfWeek, schemaPath.completedDayOfWeek);
  zodValidate(CompletedTime, schemaPath.completedTime);
  zodValidate(IntervalWeeks, schemaPath.intervalWeeks);
});

/**
 * 週によるリキャストを作成します。
 * @param fieldsValue 週によるリキャストのフィールド
 * @returns 週によるリキャスト
 */
export function toWeeklyRecast(fieldsValue: WeeklyRecastFields): WeeklyRecast {
  const fields = zodParse(WeeklyRecastFields, fieldsValue);
  // 週によるリキャストを作成します。
  const weeklyRecast = zodSafeParse(WeeklyRecast, {
    recastType: 'weekly',
    completedDayOfWeek: fields.completedDayOfWeek,
    completedTime: fields.completedTime,
    intervalWeeks: fields.intervalWeeks,
  });
  if (!weeklyRecast.success) {
    throw new DevelopmentError('週によるリキャストに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue: fieldsValue,
    });
  }
  return weeklyRecast.data;
}

/**
 * 週によるリキャストのフィールドのデフォルト値を作成します。
 * @returns 週によるリキャストのフィールドのデフォルト値
 */
export function defaultWeeklyRecastFields(): WeeklyRecastFields {
  return {
    completedDayOfWeek: '',
    completedTime: '',
    intervalWeeks: 0,
  };
}
