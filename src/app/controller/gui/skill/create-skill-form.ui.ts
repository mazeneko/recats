import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { apply, Field, form, schema, submit } from '@angular/forms/signals';
import { LocalDateTime } from '@js-joda/core';
import z from 'zod';

import { DevelopmentError } from '../../../error/development-error';
import { CreateSkillEvent } from '../../../feature/skill/domain/event/skill-event';
import {
  CastingChargeLimit,
  InitiallyAvailable,
  SkillName,
} from '../../../feature/skill/domain/skill';
import { zodParse, zodSafeParse } from '../../../util/zod';
import { zodFormField, zodValidate } from '../../../util/zod-angular';
import { FieldErrorsUi } from '../parts/field-errors.ui';
import {
  DELEGATING_RECAST_FIELDS_DEFAULT,
  DELEGATING_RECAST_FIELDS_SCHEMA,
  DelegatingRecastFields,
  DelegatingRecastFieldsUi,
  toRecast,
} from './recast/delegating-recast-fields.ui';

/**
 * スキル作成フォーム
 */
@Component({
  selector: 'app-create-skill-form',
  imports: [Field, FieldErrorsUi, DelegatingRecastFieldsUi],
  template: `
    <form novalidate (submit)="$event.preventDefault(); emitCreateSkill()" class="flex flex-col">
      <!-- 名前 -->
      <div>
        <label>Name:<input type="text" [field]="createSkillForm.name" placeholder="Name" /></label>
        <app-field-errors [fieldState]="createSkillForm.name()"></app-field-errors>
      </div>
      <!-- リキャスト -->
      <app-delegating-recast-fields
        [fields]="createSkillForm.delegatingRecastFields"
      ></app-delegating-recast-fields>
      <!-- 初期状態でスキルが使用可能 -->
      <div>
        <label
          >Initially Available:<input type="checkbox" [field]="createSkillForm.initiallyAvailable"
        /></label>
        <app-field-errors [fieldState]="createSkillForm.initiallyAvailable()"></app-field-errors>
      </div>
      <!-- 最大チャージ数 -->
      <div>
        <label
          >Charge Limit:<input
            type="number"
            [field]="createSkillForm.castingChargeLimit"
            placeholder="Charge Limit"
        /></label>
        <app-field-errors [fieldState]="createSkillForm.castingChargeLimit()"></app-field-errors>
      </div>
      <!-- 作成ボタン -->
      <button type="submit">Create</button>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSkillFormUi {
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** スキル作成フォームのデフォルト値 */
  readonly createSkillFormDefault = input<CreateSkillForm>(CREATE_SKILL_FORM_DEFAULT);
  /** スキル作成フォーム */
  readonly createSkillForm = form(signal(CREATE_SKILL_FORM_DEFAULT), CREATE_SKILL_FORM_SCHEMA);
  /** スキル作成が実行された */
  readonly createSkill = output<CreateSkillSubmission>();

  constructor() {
    // デフォルト値が変わったらフォームをデフォルト値でリセットします。
    effect(() => this.createSkillForm().reset(this.createSkillFormDefault()));
  }

  /**
   * フォームをリセットします。
   * @param value リセットに使う値。省略した場合はデフォルト値となります。
   */
  reset(value?: CreateSkillForm): void {
    this.createSkillForm().reset(value ?? this.createSkillFormDefault());
  }

  /**
   * スキルを作成します。
   */
  emitCreateSkill(): void {
    // NOTE submitメソッドによってフォームの検証やtouchedの有効化などが行われます。
    submit(this.createSkillForm, async (form) => {
      const formValue = form().value();
      const createSkillEvent = toCreateSkillEvent(formValue, this.currentDateTime());
      this.createSkill.emit({
        createSkillEvent,
        createSkillForm: formValue,
        resetForm: (value) => this.reset(value),
      });
    });
  }
}

/** スキル作成フォーム */
const CreateSkillForm = z
  .strictObject({
    /** スキル名 */
    name: zodFormField.string(),
    /** リキャストのフィールド */
    delegatingRecastFields: DelegatingRecastFields,
    /** 初期状態でスキルが使用可能 */
    initiallyAvailable: zodFormField.boolean(),
    /** 最大チャージ数 */
    castingChargeLimit: zodFormField.number(),
  })
  .readonly();
export type CreateSkillForm = z.input<typeof CreateSkillForm>;

/** スキル作成フォームのスキーマ */
const CREATE_SKILL_FORM_SCHEMA = schema<CreateSkillForm>((schemaPath) => {
  zodValidate(SkillName, schemaPath.name);
  apply(schemaPath.delegatingRecastFields, DELEGATING_RECAST_FIELDS_SCHEMA);
  zodValidate(InitiallyAvailable, schemaPath.initiallyAvailable, { required: false });
  zodValidate(CastingChargeLimit, schemaPath.castingChargeLimit);
});

/**
 * スキル作成イベントを作成します。
 * @param formValue スキル作成フォーム
 * @param now 現在日時
 * @returns スキル作成イベント
 */
function toCreateSkillEvent(formValue: CreateSkillForm, now: LocalDateTime): CreateSkillEvent {
  const form = zodParse(CreateSkillForm, formValue);
  const recast = toRecast(formValue.delegatingRecastFields);
  // スキル作成イベントを作成します。
  const createSkillEvent = zodSafeParse(CreateSkillEvent, {
    name: form.name,
    recast,
    initiallyAvailable: form.initiallyAvailable,
    castingChargeLimit: form.castingChargeLimit,
    createdAt: now,
  });
  if (!createSkillEvent.success) {
    throw new DevelopmentError('スキル作成イベントに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue,
    });
  }
  return createSkillEvent.data;
}

/** スキル作成フォームのデフォルト値 */
const CREATE_SKILL_FORM_DEFAULT: CreateSkillForm = {
  name: '',
  delegatingRecastFields: DELEGATING_RECAST_FIELDS_DEFAULT,
  initiallyAvailable: false,
  castingChargeLimit: 1,
};

/** スキル作成フォームの送信 */
export interface CreateSkillSubmission {
  /** スキル作成イベント */
  readonly createSkillEvent: CreateSkillEvent;
  /** 入力されたフォームの値 */
  readonly createSkillForm: CreateSkillForm;
  /**
   * フォームをリセットします。
   * @param value リセットに使う値。省略した場合は初期値となります。
   */
  readonly resetForm: (value?: CreateSkillForm) => void;
}
