import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { skillLogic } from '../../../feature/skill/domain';
import { Skill, SkillId } from '../../../feature/skill/domain/skill';

/**
 * スキルリスト
 */
@Component({
  selector: 'app-skill-list',
  imports: [],
  template: `
    <div class="flex flex-col gap-4">
      @for (skill of skills(); track skill.id) {
        <div>
          <h3>name: {{ skill.name }}</h3>
          <p>lastUsedAt: {{ skill.lastUsedAt ?? 'not used' }}</p>
          <p>recastAt: {{ skillLogic.recastAt(skill) ?? 'none' }}</p>
          <p>untilReady: {{ skillLogic.untilRecast(skill, currentDateTime()) ?? 'infinity' }}</p>
          <p>charge: {{ skill.castingCharge }}</p>
          <button
            type="button"
            (click)="emitUseSkill(skill.id)"
            [disabled]="!skillLogic.hasCharge(skill)"
          >
            Use
          </button>
        </div>
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
  /** スキルロジック */
  readonly skillLogic = skillLogic;

  /**
   * スキルを使用します。
   * @param skillId スキルID
   */
  emitUseSkill(skillId: SkillId): void {
    this.useSkill.emit(skillId);
  }
}
