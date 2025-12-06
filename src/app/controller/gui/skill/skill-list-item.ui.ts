import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { skillLogic } from '../../../feature/skill/domain';
import { Skill, SkillId } from '../../../feature/skill/domain/skill';

/**
 * スキルリストのアイテム
 */
@Component({
  selector: 'app-skill-list-item',
  imports: [],
  template: `
    <h3>name: {{ skill().name }}</h3>
    <p>lastUsedAt: {{ skill().lastUsedAt ?? 'not used' }}</p>
    <p>recastAt: {{ skillLogic.recastAt(skill()) ?? 'none' }}</p>
    <p>untilReady: {{ skillLogic.untilRecast(skill(), currentDateTime()) ?? 'infinity' }}</p>
    <p>charge: {{ skill().castingCharge }} / {{ skill().castingChargeLimit }}</p>
    <button type="button" (click)="emitUseSkill()" [disabled]="!skillLogic.hasCharge(skill())">
      Use
    </button>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillListItemUi {
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** スキル */
  readonly skill = input.required<Skill>();
  /** スキルが使用された */
  readonly useSkill = output<SkillId>();
  /** スキルロジック */
  readonly skillLogic = skillLogic;

  /**
   * スキルを使用します。
   */
  emitUseSkill(): void {
    this.useSkill.emit(this.skill().id);
  }
}
