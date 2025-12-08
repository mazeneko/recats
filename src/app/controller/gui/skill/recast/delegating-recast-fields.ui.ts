import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { apply, Field, FieldTree, hidden, schema } from '@angular/forms/signals';
import z from 'zod';

import { DevelopmentError } from '../../../../error/development-error';
import { ManualRecast, Recast, RecastType } from '../../../../feature/skill/domain/recast';
import { zodParse, zodUnknownSafeParse } from '../../../../util/zod';
import { zodFormField, zodValidate } from '../../../../util/zod-angular';
import { FieldErrorsUi } from '../../parts/field-errors.ui';
import {
  DAILY_RECAST_FIELDS_DEFAULT,
  DAILY_RECAST_FIELDS_SCHEMA,
  DailyRecastFields,
  DailyRecastFieldsUi,
  toDailyRecast,
} from './daily-recast-fields.ui';
import {
  DURATION_RECAST_FIELDS_DEFAULT,
  DURATION_RECAST_FIELDS_SCHEMA,
  DurationRecastFields,
  DurationRecastFieldsUi,
  toDurationRecast,
} from './duration-recast-fields.ui';

/**
 * リキャストのフィールド
 */
@Component({
  selector: 'app-delegating-recast-fields',
  imports: [Field, FieldErrorsUi, DurationRecastFieldsUi, DailyRecastFieldsUi],
  template: `
    <!-- リキャストタイプ -->
    <div>
      <select [field]="fields().recastType">
        @for (recastType of RecastType.options; track $index) {
          <option [value]="recastType">{{ recastType }}</option>
        }
      </select>
      <app-field-errors [fieldState]="fields().recastType()"></app-field-errors>
    </div>
    <!-- 時間によるリキャスト -->
    @if (!fields().durationRecastFields().hidden()) {
      <app-duration-recast-fields
        [fields]="fields().durationRecastFields"
      ></app-duration-recast-fields>
    }
    <!-- 日によるリキャスト -->
    @if (!fields().dailyRecastFields().hidden()) {
      <app-daily-recast-fields [fields]="fields().dailyRecastFields"></app-daily-recast-fields>
    }
    <!-- 週によるリキャスト -->
    <!-- // TODO まだ作ってない -->
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegatingRecastFieldsUi {
  /** リキャストのフィールド */
  readonly fields = input.required<FieldTree<DelegatingRecastFields>>();
  /** リキャストタイプ */
  readonly RecastType = RecastType;
}

/** リキャストのフィールド */
export const DelegatingRecastFields = z
  .strictObject({
    /** リキャストタイプ */
    recastType: zodFormField.string(),
    /** 時間によるリキャストフォーム */
    durationRecastFields: DurationRecastFields,
    /** 日によるリキャストフォーム */
    dailyRecastFields: DailyRecastFields,
    /** 週によるリキャストフォーム */
    // TODO まだ作ってない
  })
  .readonly();
export type DelegatingRecastFields = z.input<typeof DelegatingRecastFields>;

/** リキャストのフィールドのスキーマ */
export const DELEGATING_RECAST_FIELDS_SCHEMA = schema<DelegatingRecastFields>((schemaPath) => {
  zodValidate(RecastType, schemaPath.recastType);
  // 時間によるリキャスト
  apply(schemaPath.durationRecastFields, DURATION_RECAST_FIELDS_SCHEMA);
  hidden(
    schemaPath.durationRecastFields,
    ({ valueOf }) => valueOf(schemaPath.recastType) !== RecastType.enum.duration,
  );
  // 日によるリキャスト
  apply(schemaPath.dailyRecastFields, DAILY_RECAST_FIELDS_SCHEMA);
  hidden(
    schemaPath.dailyRecastFields,
    ({ valueOf }) => valueOf(schemaPath.recastType) !== RecastType.enum.daily,
  );
  // 週によるリキャスト
  // TODO
});

/**
 * リキャストを作成します。
 * @param fieldsValue リキャストのフィールド
 * @returns リキャスト
 */
export function toRecast(fieldsValue: DelegatingRecastFields): Recast {
  const fields = zodParse(DelegatingRecastFields, fieldsValue);
  const recastType = zodUnknownSafeParse(RecastType, fields.recastType as unknown);
  if (!recastType.success) {
    throw new DevelopmentError('リキャストタイプに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue: fieldsValue,
    });
  }
  // リキャストを作成します。
  switch (recastType.data) {
    case 'duration':
      return toDurationRecast(fieldsValue.durationRecastFields);
    case 'daily':
      return toDailyRecast(fieldsValue.dailyRecastFields);
    case 'weekly':
      return zodParse(ManualRecast, { recastType: 'manual' }); // TODO まだ作ってない
    case 'manual':
      return zodParse(ManualRecast, { recastType: 'manual' });
  }
}

/** 時間によるリキャストのフィールドのデフォルト値 */
export const DELEGATING_RECAST_FIELDS_DEFAULT: DelegatingRecastFields = {
  recastType: RecastType.enum.duration,
  durationRecastFields: DURATION_RECAST_FIELDS_DEFAULT,
  dailyRecastFields: DAILY_RECAST_FIELDS_DEFAULT,
};
