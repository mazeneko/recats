import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { UseSkillEvent } from '../../../feature/skill/domain/event/skill-event';
import { SKILL_MUTATOR, SKILL_READER } from '../../../feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from '../../../util/current-date-time-provider';
import { CreateSkillFormUi, CreateSkillSubmission } from './create-skill-form.ui';
import { SkillListUi } from './skill-list.ui';

/**
 * スキルページ
 */
@Component({
  selector: 'app-skill-page',
  imports: [CreateSkillFormUi, SkillListUi],
  template: `
    <app-create-skill-form
      [currentDateTime]="currentDateTime()"
      (createSkill)="createSkill($event)"
    ></app-create-skill-form>
    <app-skill-list
      [currentDateTime]="currentDateTime()"
      [skills]="skills()"
      (useSkill)="useSkill($event)"
    ></app-skill-list>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillPageUi {
  /** 現在日時 */
  readonly currentDateTime = inject(CURRENT_DATE_TIME);
  /** SkillReader */
  readonly skillReader = inject(SKILL_READER);
  /** skillMutator */
  readonly skillMutator = inject(SKILL_MUTATOR);
  /** スキルのリスト */
  readonly skills = this.skillReader.skills();

  /**
   * スキルを作成します。
   * @param submission スキル作成フォームの送信
   */
  createSkill(submission: CreateSkillSubmission): void {
    this.skillMutator.handleCreateSkillEvent(submission.createSkillEvent);
    submission.resetForm();
  }

  /**
   * スキルを使用します。
   * @param useSkillEvent スキル使用イベント
   */
  useSkill(useSkillEvent: UseSkillEvent): void {
    this.skillMutator.handleUseSkillEvent(useSkillEvent);
  }
}
