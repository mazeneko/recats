import { Component, inject } from '@angular/core';

import {
  AddChargeEvent,
  DeleteSkillEvent,
  UseSkillEvent,
} from '../../../feature/skill/domain/event/skill-event';
import { SKILL_MUTATOR, SKILL_READER } from '../../../feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from '../../../util/current-date-time-provider';
import { CreateSkillFormUi } from './create-skill-form.ui';
import { SkillListUi } from './skill-list.ui';

/**
 * スキルページ
 */
@Component({
  selector: 'app-skill-page',
  imports: [CreateSkillFormUi, SkillListUi],
  template: `
    <app-create-skill-form [currentDateTime]="currentDateTime()"></app-create-skill-form>
    <app-skill-list
      [currentDateTime]="currentDateTime()"
      [skills]="skills()"
      (useSkill)="useSkill($event)"
      (addCharge)="addCharge($event)"
      (deleteSkill)="deleteSkill($event)"
    ></app-skill-list>
  `,
  styles: ``,
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
   * スキルを使用します。
   * @param useSkillEvent スキル使用イベント
   */
  useSkill(useSkillEvent: UseSkillEvent): void {
    this.skillMutator.handleUseSkillEvent(useSkillEvent);
  }

  /**
   * チャージを追加します。
   * @param addChargeEvent チャージ追加イベント
   */
  addCharge(addChargeEvent: AddChargeEvent): void {
    this.skillMutator.handleAddChargeEvent(addChargeEvent);
  }

  /**
   * スキルを使用します。
   * @param deleteSkillEvent スキル使用イベント
   */
  deleteSkill(deleteSkillEvent: DeleteSkillEvent): void {
    this.skillMutator.handleDeleteSkillEvent(deleteSkillEvent);
  }
}
