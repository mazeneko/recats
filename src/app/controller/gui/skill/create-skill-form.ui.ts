import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { Field, form, submit } from '@angular/forms/signals';
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

/** スキル作成イベントを作るためのスキル作成フォームのスキーマ */
const CreateSkillFormSchema = z
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
  // TODO 変換関数でもいいかも
  .transform<CreateSkillEvent | null>(
    (form) =>
      zodSafeParse(CreateSkillEvent, {
        name: form.name,
        recast: { recastType: 'duration', recastTime: Duration.ofSeconds(form.recastSeconds) },
        initiallyAvailable: form.initiallyAvailable,
        castingChargeLimit: form.castingChargeLimit,
      }).data ?? null,
  );
/** スキル作成フォーム */
export type CreateSkillForm = z.input<typeof CreateSkillFormSchema>;
/** スキル作成フォームの初期値のデフォルト */
const createSkillFormInitialDefault: CreateSkillForm = {
  name: '',
  recastSeconds: NaN,
  initiallyAvailable: false,
  castingChargeLimit: 1,
};
/** スキル作成フォームの送信 */
export interface CreateSkillSubmission {
  /** スキル作成イベント */
  createSkillEvent: CreateSkillEvent;
  /** 入力されたフォームの値 */
  createSkillForm: CreateSkillForm;
  /**
   * フォームをリセットします。
   * @param value リセットに使う値。省略した場合は初期値となります。
   */
  reset: (value?: CreateSkillForm) => void;
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
  /** スキル作成が実行された */
  readonly createSkill = output<CreateSkillSubmission>();
  /** スキル作成フォームの初期値 */
  readonly createSkillFormInitial = input<CreateSkillForm>(createSkillFormInitialDefault);
  /** スキル作成フォームのモデル */
  readonly createSkillFormModel = signal(createSkillFormInitialDefault);
  /** スキル作成フォーム */ // TODO これもクラス外に書いてまとめたほうが見やすいか？
  readonly createSkillForm = form(this.createSkillFormModel, (schemaPath) => {
    zodValidate(SkillName, schemaPath.name);
    zodValidate(z.int().min(1), schemaPath.recastSeconds);
    zodValidate(InitiallyAvailable, schemaPath.initiallyAvailable, { required: false });
    zodValidate(CastingChargeLimit, schemaPath.castingChargeLimit);
  });

  constructor() {
    // 初期値が変わったらフォームに初期値を設定します。
    effect(() => this.createSkillFormModel.set(this.createSkillFormInitial()));
  }

  /**
   * フォームをリセットします。
   * @param value リセットに使う値。省略した場合は初期値となります。
   */
  reset(value?: CreateSkillForm): void {
    this.createSkillForm().reset(value ?? this.createSkillFormInitial());
  }

  /**
   * スキルを作成します。
   */
  emitCreateSkill(): void {
    submit(this.createSkillForm, async (form) => {
      const formValue = form().value();
      // フォームからイベントを作成します。
      const createSkillEvent = zodParse(CreateSkillFormSchema, formValue);
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
        reset: (value) => this.reset(value),
      });
    });
  }
}
