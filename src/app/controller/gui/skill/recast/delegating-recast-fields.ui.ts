import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { applyWhen, Field, FieldTree, schema } from '@angular/forms/signals';
import z from 'zod';

import { DevelopmentError } from '../../../../error/development-error';
import { ManualRecast, Recast, RecastType } from '../../../../feature/skill/domain/recast';
import { zodParse, zodUnknownSafeParse } from '../../../../util/zod';
import { zodFormField, zodValidate } from '../../../../util/zod-angular';
import { FieldErrorsUi } from '../../parts/field-errors.ui';
import {
  DURATION_RECAST_FIELDS_DEFAULT,
  DURATION_RECAST_FIELDS_SCHEMA,
  DurationRecastFields,
  DurationRecastFieldsUi,
  toDurationRecast,
} from './duration-recast-fields.ui';

// TODO コメント
@Component({
  selector: 'app-delegating-recast-fields',
  imports: [Field, FieldErrorsUi, DurationRecastFieldsUi],
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
    <!-- 各リキャスト -->
    @switch (fields().recastType().value()) {
      <!-- 時間によるリキャスト -->
      @case (RecastType.enum.duration) {
        <app-duration-recast-fields
          [fields]="fields().durationRecastForm"
        ></app-duration-recast-fields>
      }
      <!-- 日によるリキャスト -->
      @case (RecastType.enum.daily) {
        <!-- // TODO まだ作ってない -->
      }
      <!-- 週によるリキャスト -->
      @case (RecastType.enum.weekly) {
        <!-- // TODO まだ作ってない -->
      }
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegatingRecastFieldsUi {
  // TODO コメント
  readonly fields = input.required<FieldTree<DelegatingRecastFields>>();
  // TODO コメント
  readonly RecastType = RecastType;
}

/** リキャストのフィールド */
export const DelegatingRecastFields = z
  .strictObject({
    /** リキャストタイプ */
    recastType: zodFormField.string(),
    /** 時間によるリキャストフォーム */
    durationRecastForm: DurationRecastFields,
    /** 日によるリキャストフォーム */
    // TODO まだ作ってない
    /** 週によるリキャストフォーム */
    // TODO まだ作ってない
  })
  .readonly();
export type DelegatingRecastFields = z.input<typeof DelegatingRecastFields>;

/** リキャストのフィールドのスキーマ */
export const DELEGATING_RECAST_FIELDS_SCHEMA = schema<DelegatingRecastFields>((schemaPath) => {
  zodValidate(RecastType, schemaPath.recastType);
  applyWhen(
    schemaPath.durationRecastForm,
    ({ valueOf }) => valueOf(schemaPath.recastType) === RecastType.enum.duration,
    DURATION_RECAST_FIELDS_SCHEMA,
  );
  // TODO 日
  // TODO 週
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
      return toDurationRecast(fieldsValue.durationRecastForm);
    case 'daily':
      return zodParse(ManualRecast, { recastType: 'manual' }); // TODO まだ作ってない
    case 'weekly':
      return zodParse(ManualRecast, { recastType: 'manual' }); // TODO まだ作ってない
    case 'manual':
      return zodParse(ManualRecast, { recastType: 'manual' });
  }
}

/** 時間によるリキャストのフィールドのデフォルト値 */
export const DELEGATING_RECAST_FIELDS_DEFAULT: DelegatingRecastFields = {
  recastType: RecastType.enum.duration,
  durationRecastForm: DURATION_RECAST_FIELDS_DEFAULT,
};
