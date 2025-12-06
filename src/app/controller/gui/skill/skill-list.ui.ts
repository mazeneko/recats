import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

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
        ></app-skill-list-item>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillListUi {
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** スキルのリスト */
  readonly skills = input.required<Skill[]>();
  /** スキルが使用された */
  readonly useSkill = output<SkillId>();

  /**
   * スキルを使用します。
   * @param skillId スキルID
   */
  emitUseSkill(skillId: SkillId): void {
    this.useSkill.emit(skillId);
  }
}
