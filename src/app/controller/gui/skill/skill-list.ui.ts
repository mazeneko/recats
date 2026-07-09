import { Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { UseSkillEvent } from '../../../feature/skill/domain/event/skill-event';
import { Skill, SkillId } from '../../../feature/skill/domain/skill';
import { SkillListItemUi } from './skill-list-item.ui';

/**
 * スキルリスト
 */
@Component({
  selector: 'app-skill-list',
  imports: [SkillListItemUi],
  template: `
    <div class="flex flex-col gap-4">
      @for (skill of skills(); track skill.id) {
        <app-skill-list-item
          [currentDateTime]="currentDateTime()"
          [skill]="skill"
          (useSkill)="emitUseSkill($event)"
          (selectSkill)="emitSelectSkill($event)"
        ></app-skill-list-item>
      }
    </div>
  `,
  styles: ``,
})
export class SkillListUi {
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** スキルのリスト */
  readonly skills = input.required<Skill[]>();
  /** スキルが使用された */
  readonly useSkill = output<UseSkillEvent>();
  /** スキルが選択された */
  readonly selectSkill = output<SkillId>();

  /**
   * スキルを使用します。
   * @param useSkillEvent スキル使用イベント
   */
  emitUseSkill(useSkillEvent: UseSkillEvent): void {
    this.useSkill.emit(useSkillEvent);
  }

  /**
   * スキルを選択します。
   * @param skillId スキルID
   */
  emitSelectSkill(skillId: SkillId): void {
    this.selectSkill.emit(skillId);
  }
}
