import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree, schema, validate } from '@angular/forms/signals';
import { Duration } from '@js-joda/core';
import z from 'zod';

import { DevelopmentError } from '../../../../error/development-error';
import { DurationRecast } from '../../../../feature/skill/domain/recast';
import { zodParse, zodSafeParse } from '../../../../util/zod';
import { zodFormField, zodValidate } from '../../../../util/zod-angular';
import { FieldErrorsUi } from '../../parts/field-errors.ui';

/**
 * 時間によるリキャストのフィールド
 */
@Component({
  selector: 'app-duration-recast-fields',
  imports: [Field, FieldErrorsUi],
  template: `
    <div>
      <label
        >Recast (days):<input
          type="number"
          [field]="fields().recastDays"
          placeholder="Recast (hours)"
      /></label>
      <app-field-errors [fieldState]="fields().recastDays()"></app-field-errors>
    </div>
    <div>
      <label
        >Recast (hours):<input
          type="number"
          [field]="fields().recastHours"
          placeholder="Recast (hours)"
      /></label>
      <app-field-errors [fieldState]="fields().recastHours()"></app-field-errors>
    </div>
    <div>
      <label
        >Recast (minutes):<input
          type="number"
          [field]="fields().recastMinutes"
          placeholder="Recast (minutes)"
      /></label>
      <app-field-errors [fieldState]="fields().recastMinutes()"></app-field-errors>
    </div>
    <div>
      <label
        >Recast (seconds):<input
          type="number"
          [field]="fields().recastSeconds"
          placeholder="Recast (seconds)"
      /></label>
      <app-field-errors [fieldState]="fields().recastSeconds()"></app-field-errors>
    </div>
    <app-field-errors [fieldState]="fields()()"></app-field-errors>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationRecastFieldsUi {
  // TODO コメント
  readonly fields = input.required<FieldTree<DurationRecastFields>>();
}

/** 時間によるリキャストのフィールド */
export const DurationRecastFields = z
  .strictObject({
    /** リキャスト日数 */
    recastDays: zodFormField.number({ required: false }),
    /** リキャスト時間数 */
    recastHours: zodFormField.number({ required: false }),
    /** リキャスト分数 */
    recastMinutes: zodFormField.number({ required: false }),
    /** リキャスト秒数 */
    recastSeconds: zodFormField.number({ required: false }),
  })
  .readonly();
export type DurationRecastFields = z.input<typeof DurationRecastFields>;

/** 時間によるリキャストのフィールドのスキーマ */
export const DURATION_RECAST_FIELDS_SCHEMA = schema<DurationRecastFields>((schemaPath) => {
  zodValidate(z.int().min(0), schemaPath.recastDays, { required: false });
  zodValidate(z.int().min(0), schemaPath.recastHours, { required: false });
  zodValidate(z.int().min(0), schemaPath.recastMinutes, { required: false });
  zodValidate(z.int().min(0), schemaPath.recastSeconds, { required: false });
  validate(schemaPath, ({ valueOf }) => {
    const hasDuration = [
      valueOf(schemaPath.recastDays),
      valueOf(schemaPath.recastHours),
      valueOf(schemaPath.recastMinutes),
      valueOf(schemaPath.recastSeconds),
    ].some((value) => 1 <= value);
    if (hasDuration) {
      return null;
    }
    return {
      kind: 'everyEmpty',
      message: 'いずれかの時間を1以上にしてください。',
    };
  });
});

/**
 * 時間によるリキャストを作成します。
 * @param fieldsValue 時間によるリキャストのフィールド
 * @returns 時間によるリキャスト
 */
export function toDurationRecast(fieldsValue: DurationRecastFields): DurationRecast {
  const fields = zodParse(DurationRecastFields, fieldsValue);
  // 時間によるリキャストを作成します。
  const durationRecast = zodSafeParse(DurationRecast, {
    recastType: 'duration',
    recastTime: Duration.ZERO.plusDays(fields.recastDays ?? 0)
      .plusHours(fields.recastHours ?? 0)
      .plusMinutes(fields.recastMinutes ?? 0)
      .plusSeconds(fields.recastSeconds ?? 0),
  });
  if (!durationRecast.success) {
    throw new DevelopmentError('時間によるリキャストに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue: fieldsValue,
    });
  }
  return durationRecast.data;
}

/** 時間によるリキャストのフィールドのデフォルト値 */
export const DURATION_RECAST_FIELDS_DEFAULT: DurationRecastFields = {
  recastDays: NaN,
  recastHours: NaN,
  recastMinutes: NaN,
  recastSeconds: NaN,
};
