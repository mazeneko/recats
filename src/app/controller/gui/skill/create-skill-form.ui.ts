import { Component, inject, model, output } from '@angular/core';

import { form, FormRoot } from '@angular/forms/signals';
import { SkillId } from '../../../feature/skill/domain/skill';
import { SKILL_MUTATOR } from '../../../feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from '../../../util/current-date-time-provider';
import {
  CREATE_SKILL_FORM_SCHEMA,
  CreateSkillForm,
  CreateSkillFormFieldsUi,
  defaultCreateSkillForm,
  toCreateSkillEvent,
} from './create-skill-form-fields.ui';

/**
 * スキル作成フォーム
 */
@Component({
  selector: 'app-create-skill-form',
  imports: [FormRoot, CreateSkillFormFieldsUi],
  template: `
    <form [formRoot]="createSkillForm">
      <app-create-skill-form-fields [fields]="createSkillForm"></app-create-skill-form-fields>
      <button type="submit" [disabled]="createSkillForm().submitting()">
        {{ createSkillForm().submitting() ? 'Creating...' : 'Create' }}
      </button>
    </form>
  `,
  styles: ``,
})
export class CreateSkillFormUi {
  /** 現在日時 */
  protected readonly currentDateTime = inject(CURRENT_DATE_TIME);
  /** skillMutator */
  protected readonly skillMutator = inject(SKILL_MUTATOR);
  /** スキル作成フォームのモデル */
  readonly createSkillFormModel = model<CreateSkillForm>(defaultCreateSkillForm());
  /** スキル作成フォーム */
  readonly createSkillForm = form(this.createSkillFormModel, CREATE_SKILL_FORM_SCHEMA, {
    submission: {
      action: async (fields) => {
        const createSkillEvent = toCreateSkillEvent(fields().value(), this.currentDateTime());
        const skillId = await this.skillMutator.handleCreateSkillEvent(createSkillEvent);
        this.skillCreated.emit(skillId);
      },
    },
  });
  /** スキルが作成された */
  readonly skillCreated = output<SkillId>();

  /**
   * フォームをデフォルト値でリセットします。
   *
   * 任意の値でリセットしたい場合はフォームフィールドのリセットメソッドを直接使用してください。
   */
  resetByDefault() {
    this.createSkillForm().reset(defaultCreateSkillForm());
  }
}
