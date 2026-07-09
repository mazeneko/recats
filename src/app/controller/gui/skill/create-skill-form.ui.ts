import { Component, inject, input, model, output } from '@angular/core';
import {
  apply,
  form,
  FormField,
  FormRoot,
  schema,
  TreeValidationResult,
} from '@angular/forms/signals';
import { LocalDateTime } from '@js-joda/core';
import z from 'zod';

import { DevelopmentError } from '../../../error/development-error';
import { CreateSkillEvent } from '../../../feature/skill/domain/event/skill-event';
import {
  ChargeLimit,
  HasInitiallyCharge,
  SkillId,
  SkillName,
} from '../../../feature/skill/domain/skill';
import { SKILL_MUTATOR } from '../../../feature/skill/domain/skill-store';
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
 * スキル作成フォーム
 */
@Component({
  selector: 'app-create-skill-form',
  imports: [FormRoot, FormField, FieldErrorsUi, DelegatingRecastFieldsUi],
  template: `
    <form [formRoot]="createSkillForm" class="flex flex-col">
      <!-- 名前 -->
      <div>
        <label
          >Name:<input type="text" [formField]="createSkillForm.name" placeholder="Name"
        /></label>
        <app-field-errors [fieldState]="createSkillForm.name()"></app-field-errors>
      </div>
      <!-- リキャスト -->
      <app-delegating-recast-fields
        [fields]="createSkillForm.delegatingRecastFields"
      ></app-delegating-recast-fields>
      <!-- 初期チャージを持っている -->
      <div>
        <label
          >Has Initially Charge:<input
            type="checkbox"
            [formField]="createSkillForm.hasInitiallyCharge"
        /></label>
        <app-field-errors [fieldState]="createSkillForm.hasInitiallyCharge()"></app-field-errors>
      </div>
      <!-- 最大チャージ数 -->
      <div>
        <label
          >Charge Limit:<input
            type="number"
            [formField]="createSkillForm.chargeLimit"
            placeholder="Charge Limit"
        /></label>
        <app-field-errors [fieldState]="createSkillForm.chargeLimit()"></app-field-errors>
      </div>
      <!-- 作成ボタン -->
      <button type="submit" [disabled]="createSkillForm().submitting()">
        @if (createSkillForm().submitting()) {
          Creating...
        } @else {
          Create
        }
      </button>
    </form>
  `,
  styles: ``,
})
export class CreateSkillFormUi {
  /** skillMutator */
  readonly skillMutator = inject(SKILL_MUTATOR);
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** フォームをリセットするときのデフォルト値 */
  readonly defaultResetValue = input<CreateSkillForm>(defaultCreateSkillForm());
  /** フォームの値 */
  readonly formModel = model<CreateSkillForm>(defaultCreateSkillForm());
  /** スキル作成フォーム */
  readonly createSkillForm = form(this.formModel, CREATE_SKILL_FORM_SCHEMA, {
    submission: {
      action: async (field) => this.createSkill(field().value()),
    },
  });
  /** スキルが作成された */
  readonly skillCreated = output<SkillId>();

  /**
   * フォームをリセットします。
   * @param value リセットに使う値。省略した場合はデフォルト値となります。
   */
  reset(value?: CreateSkillForm): void {
    this.createSkillForm().reset(value ?? this.defaultResetValue());
  }

  /**
   * スキルを作成します。
   * @param createSkillForm スキル作成フォーム
   */
  async createSkill(createSkillForm: CreateSkillForm): Promise<TreeValidationResult> {
    const createSkillEvent = toCreateSkillEvent(createSkillForm, this.currentDateTime());
    const skillId = await this.skillMutator.handleCreateSkillEvent(createSkillEvent); // NOTE エラーをバリデーションエラーとしたい場合はcatchしてValidationErrorを返してください。
    this.reset();
    this.skillCreated.emit(skillId);
  }
}

/** スキル作成フォーム */
const CreateSkillForm = z
  .strictObject({
    /** スキル名 */
    name: zodFormField.string(),
    /** リキャストのフィールド */
    delegatingRecastFields: DelegatingRecastFields,
    /** 初期チャージを持っている */
    hasInitiallyCharge: zodFormField.boolean(),
    /** 最大チャージ数 */
    chargeLimit: zodFormField.number(),
  })
  .readonly();
export type CreateSkillForm = z.input<typeof CreateSkillForm>;

/** スキル作成フォームのスキーマ */
const CREATE_SKILL_FORM_SCHEMA = schema<CreateSkillForm>((schemaPath) => {
  zodValidate(SkillName, schemaPath.name);
  apply(schemaPath.delegatingRecastFields, DELEGATING_RECAST_FIELDS_SCHEMA);
  zodValidate(HasInitiallyCharge, schemaPath.hasInitiallyCharge, { required: false });
  zodValidate(ChargeLimit, schemaPath.chargeLimit);
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
    hasInitiallyCharge: form.hasInitiallyCharge,
    chargeLimit: form.chargeLimit,
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

/**
 * スキル作成フォームのデフォルト値を作成します。
 * @returns スキル作成フォームのデフォルト値
 */
function defaultCreateSkillForm(): CreateSkillForm {
  return {
    name: '',
    delegatingRecastFields: defaultDelegatingRecastFields(),
    hasInitiallyCharge: false,
    chargeLimit: 1,
  };
}
