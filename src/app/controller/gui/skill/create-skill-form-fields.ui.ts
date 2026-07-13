import { Component, input } from '@angular/core';
import { apply, FieldTree, FormField, schema } from '@angular/forms/signals';
import { LocalDateTime } from '@js-joda/core';
import z from 'zod';

import { DevelopmentError } from '../../../error/development-error';
import { CreateSkillEvent } from '../../../feature/skill/domain/event/skill-event';
import { ChargeLimit, SkillName } from '../../../feature/skill/domain/skill';
import { zodParse, zodSafeParse } from '../../../util/zod';
import { zodFormField, zodValidate } from '../../../util/zod-angular';
import { FieldErrorsUi } from '../parts/field-errors.ui';
import {
  defaultDelegatingRecastFields,
  DELEGATING_RECAST_FIELDS_SCHEMA,
  DelegatingRecastFields,
  DelegatingRecastFieldsUi,
  toRecast,
} from './recast/delegating-recast-fields.ui';

/**
 * スキル作成フォームのフィールド
 */
@Component({
  selector: 'app-create-skill-form-fields',
  imports: [FormField, FieldErrorsUi, DelegatingRecastFieldsUi],
  template: `
    <div class="flex flex-col">
      <!-- 名前 -->
      <div>
        <label>Name:<input type="text" [formField]="fields().name" placeholder="Name" /></label>
        <app-field-errors [fieldState]="fields().name()"></app-field-errors>
      </div>
      <!-- リキャスト -->
      <app-delegating-recast-fields
        [fields]="fields().delegatingRecastFields"
      ></app-delegating-recast-fields>
      <!-- 最大チャージ数 -->
      <div>
        <label
          >Charge Limit:<input
            type="number"
            [formField]="fields().chargeLimit"
            placeholder="Charge Limit"
        /></label>
        <app-field-errors [fieldState]="fields().chargeLimit()"></app-field-errors>
      </div>
    </div>
  `,
  styles: ``,
})
export class CreateSkillFormFieldsUi {
  /** 日によるリキャストのフィールド */
  readonly fields = input.required<FieldTree<CreateSkillForm>>();
}

/** スキル作成フォーム */
export const CreateSkillForm = z
  .strictObject({
    /** スキル名 */
    name: zodFormField.string(),
    /** リキャストのフィールド */
    delegatingRecastFields: DelegatingRecastFields,
    /** 最大チャージ数 */
    chargeLimit: zodFormField.number(),
  })
  .readonly();
export type CreateSkillForm = z.input<typeof CreateSkillForm>;

/** スキル作成フォームのスキーマ */
export const CREATE_SKILL_FORM_SCHEMA = schema<CreateSkillForm>((schemaPath) => {
  zodValidate(SkillName, schemaPath.name);
  apply(schemaPath.delegatingRecastFields, DELEGATING_RECAST_FIELDS_SCHEMA);
  zodValidate(ChargeLimit, schemaPath.chargeLimit);
});

/**
 * スキル作成イベントを作成します。
 * @param formValue スキル作成フォーム
 * @param now 現在日時
 * @returns スキル作成イベント
 */
export function toCreateSkillEvent(
  formValue: CreateSkillForm,
  now: LocalDateTime,
): CreateSkillEvent {
  const form = zodParse(CreateSkillForm, formValue);
  const recast = toRecast(formValue.delegatingRecastFields);
  // スキル作成イベントを作成します。
  const createSkillEvent = zodSafeParse(CreateSkillEvent, {
    name: form.name,
    createdAt: now,
    recast,
    chargeLimit: form.chargeLimit,
  });
  if (!createSkillEvent.success) {
    throw new DevelopmentError('スキル作成イベントに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue,
    });
  }
  return createSkillEvent.data;
}

/**
 * スキル作成フォームのデフォルト値を作成します。
 * @returns スキル作成フォームのデフォルト値
 */
export function defaultCreateSkillForm(): CreateSkillForm {
  return {
    name: '',
    delegatingRecastFields: defaultDelegatingRecastFields(),
    chargeLimit: 1,
  };
}
