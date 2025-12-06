import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { Field, form, schema, submit } from '@angular/forms/signals';
import { Duration } from '@js-joda/core';
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

/** スキル作成イベントを作るためのスキル作成フォーム */
const CreateSkillFormToEvent = z
  .strictObject({
    /** スキル名 */
    name: zodFormField.string,
    /** リキャスト秒数 */
    recastSeconds: zodFormField.number,
    /** 初期状態でスキルが使用可能 */
    initiallyAvailable: zodFormField.boolean,
    /** 最大チャージ数 */
    castingChargeLimit: zodFormField.number,
  })
  .readonly()
  .transform<CreateSkillEvent | null>((form) => {
    const createSkillEvent = zodSafeParse(CreateSkillEvent, {
      name: form.name,
      recast: { recastType: 'duration', recastTime: Duration.ofSeconds(form.recastSeconds) },
      initiallyAvailable: form.initiallyAvailable,
      castingChargeLimit: form.castingChargeLimit,
    });
    return createSkillEvent.success ? createSkillEvent.data : null;
  });
/** スキル作成フォーム */
export type CreateSkillForm = z.input<typeof CreateSkillFormToEvent>;
/** スキル作成フォームのスキーマ */
const CREATE_SKILL_FORM_SCHEMA = schema<CreateSkillForm>((schemaPath) => {
  zodValidate(SkillName, schemaPath.name);
  zodValidate(z.int().min(1), schemaPath.recastSeconds);
  zodValidate(InitiallyAvailable, schemaPath.initiallyAvailable, { required: false });
  zodValidate(CastingChargeLimit, schemaPath.castingChargeLimit);
});
/** スキル作成フォームのデフォルト値 */
const CREATE_SKILL_FORM_DEFAULT: CreateSkillForm = {
  name: '',
  recastSeconds: NaN,
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

/**
 * スキル作成フォーム
 */
@Component({
  selector: 'app-create-skill-form',
  imports: [Field, FieldErrorsUi],
  template: `
    <form novalidate (submit)="$event.preventDefault(); emitCreateSkill()" class="flex flex-col">
      <!-- 名前 -->
      <div>
        <label>Name:<input type="text" [field]="createSkillForm.name" placeholder="Name" /></label>
        <app-field-errors [fieldState]="createSkillForm.name()"></app-field-errors>
      </div>
      <!-- リキャスト秒数 -->
      <div>
        <label
          >Recast (seconds):<input
            type="number"
            [field]="createSkillForm.recastSeconds"
            placeholder="Recast (seconds)"
        /></label>
        <app-field-errors [fieldState]="createSkillForm.recastSeconds()"></app-field-errors>
      </div>
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
      // フォームからイベントを作成します。
      const createSkillEvent = zodParse(CreateSkillFormToEvent, formValue);
      if (createSkillEvent === null) {
        throw new DevelopmentError('スキル作成イベントに変換できませんでした。', {
          errorCode: 'FormDefinitionMistake',
          formValue: formValue,
        });
      }
      // 親コンポーネントに通知します。
      this.createSkill.emit({
        createSkillEvent,
        createSkillForm: formValue,
        resetForm: (value) => this.reset(value),
      });
    });
  }
}
