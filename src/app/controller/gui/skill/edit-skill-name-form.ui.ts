import { Component, inject, input, model, output } from '@angular/core';
import { form, FormField, FormRoot, schema, TreeValidationResult } from '@angular/forms/signals';
import { LocalDateTime } from '@js-joda/core';
import z from 'zod';

import { DevelopmentError } from '../../../error/development-error';
import { EditSkillNameEvent } from '../../../feature/skill/domain/event/skill-event';
import { SkillId, SkillName } from '../../../feature/skill/domain/skill';
import { SKILL_MUTATOR } from '../../../feature/skill/domain/skill-store';
import { zodParse, zodSafeParse } from '../../../util/zod';
import { zodFormField, zodValidate } from '../../../util/zod-angular';
import { FieldErrorsUi } from '../parts/field-errors.ui';

/**
 * スキル名編集フォーム
 */
@Component({
  selector: 'app-edit-skill-name-form',
  imports: [FormRoot, FormField, FieldErrorsUi],
  template: `
    <form [formRoot]="editSkillNameForm" class="flex flex-col">
      <!-- 名前 -->
      <div>
        <label
          >Name:<input type="text" [formField]="editSkillNameForm.name" placeholder="Name"
        /></label>
        <app-field-errors [fieldState]="editSkillNameForm.name()"></app-field-errors>
      </div>
      <!-- 作成ボタン -->
      <button type="submit" [disabled]="editSkillNameForm().submitting()">
        @if (editSkillNameForm().submitting()) {
          Editing...
        } @else {
          Edit
        }
      </button>
    </form>
  `,
  styles: ``,
})
export class EditSkillNameFormUi {
  /** skillMutator */
  readonly skillMutator = inject(SKILL_MUTATOR);
  /** スキルID */
  readonly skillId = input.required<SkillId>();
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** フォームをリセットするときのデフォルト値 */
  readonly defaultResetValue = input<EditSkillNameForm>(defaultEditSkillNameForm());
  /** フォームの値 */
  readonly formModel = model<EditSkillNameForm>(defaultEditSkillNameForm());
  /** スキル名編集フォーム */
  readonly editSkillNameForm = form(this.formModel, EDIT_SKILL_NAME_FORM_SCHEMA, {
    submission: {
      action: async (field) => this.editSkillName(field().value()),
    },
  });
  /** スキルが作成された */
  readonly skillNameEdited = output<void>();

  /**
   * フォームをリセットします。
   * @param value リセットに使う値。省略した場合はデフォルト値となります。
   */
  reset(value?: EditSkillNameForm): void {
    this.editSkillNameForm().reset(value ?? this.defaultResetValue());
  }

  /**
   * スキルを作成します。
   * @param editSkillNameForm スキル名編集フォーム
   */
  async editSkillName(editSkillNameForm: EditSkillNameForm): Promise<TreeValidationResult> {
    const editSkillNameEvent = toEditSkillNameEvent(
      this.skillId(),
      editSkillNameForm,
      this.currentDateTime(),
    );
    await this.skillMutator.handleEditSkillNameEvent(editSkillNameEvent); // NOTE エラーをバリデーションエラーとしたい場合はcatchしてValidationErrorを返してください。
    this.skillNameEdited.emit();
  }
}

/** スキル名編集フォーム */
const EditSkillNameForm = z
  .strictObject({
    /** スキル名 */
    name: zodFormField.string(),
  })
  .readonly();
export type EditSkillNameForm = z.input<typeof EditSkillNameForm>;

/** スキル名編集フォームのスキーマ */
const EDIT_SKILL_NAME_FORM_SCHEMA = schema<EditSkillNameForm>((schemaPath) => {
  zodValidate(SkillName, schemaPath.name);
});

/**
 * スキル名編集イベントを作成します。
 * @param formValue スキル名編集フォーム
 * @param now 現在日時
 * @returns スキル名編集イベント
 */
function toEditSkillNameEvent(
  skillId: SkillId,
  formValue: EditSkillNameForm,
  now: LocalDateTime,
): EditSkillNameEvent {
  const form = zodParse(EditSkillNameForm, formValue);
  // スキル名編集イベントを作成します。
  const editSkillNameEvent = zodSafeParse(EditSkillNameEvent, {
    skillId,
    name: form.name,
    editedAt: now,
  });
  if (!editSkillNameEvent.success) {
    throw new DevelopmentError('スキル名編集イベントに変換できませんでした。', {
      errorCode: 'FormDefinitionMistake',
      formValue,
    });
  }
  return editSkillNameEvent.data;
}

/**
 * スキル名編集フォームのデフォルト値を作成します。
 * @returns スキル名編集フォームのデフォルト値
 */
function defaultEditSkillNameForm(): EditSkillNameForm {
  return {
    name: '',
  };
}
