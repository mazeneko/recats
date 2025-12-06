import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import {
  RefreshCastingChargeEvent,
  UseSkillEvent,
} from '../../../feature/skill/domain/event/skill-event';
import { SkillId } from '../../../feature/skill/domain/skill';
import { SKILL_MUTATOR, SKILL_READER } from '../../../feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from '../../../util/current-date-time-provider';
import { zodParse } from '../../../util/zod';
import { CreateSkillFormUi, CreateSkillSubmission } from './create-skill-form.ui';
import { SkillListUi } from './skill-list.ui';

/**
 * スキルページ
 */
@Component({
  selector: 'app-skill-page',
  imports: [CreateSkillFormUi, SkillListUi],
  template: `
    <app-create-skill-form (createSkill)="createSkill($event)"></app-create-skill-form>
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

  constructor() {
    // TODO サービスにうつす
    toObservable(this.currentDateTime).subscribe((now) =>
      this.skillMutator.handleRefreshCastingChargeEvent(
        zodParse(RefreshCastingChargeEvent, { now }),
      ),
    );
  }

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
   * @param skillId スキルID
   */
  useSkill(skillId: SkillId): void {
    const useSkillEvent = zodParse(UseSkillEvent, { skillId });
    this.skillMutator.handleUseSkillEvent(useSkillEvent);
  }
}
