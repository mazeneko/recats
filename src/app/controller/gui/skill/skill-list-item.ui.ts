import { Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { DecimalPipe } from '@angular/common';
import { skillLogic } from '../../../feature/skill/domain';
import { UseSkillEvent } from '../../../feature/skill/domain/event/skill-event';
import { Skill, SkillId } from '../../../feature/skill/domain/skill';
import { zodParse } from '../../../util/zod';

/**
 * スキルリストのアイテム
 */
@Component({
  selector: 'app-skill-list-item',
  imports: [DecimalPipe],
  template: `
    <h3 (click)="emitSelectSkill()">name: {{ skill().name }}</h3>
    <p>
      progress:
      {{
        (skillLogic.getNextChargeProgress(skill(), currentDateTime()) | number: '1.0-0') ?? 'none'
      }}
    </p>
    <p>
      charges: {{ skillLogic.countCharges(skill(), currentDateTime()) }} /
      {{ skill().chargeLimit }}
    </p>
    <button
      type="button"
      (click)="emitUseSkill()"
      [disabled]="!skillLogic.hasCharge(skill(), currentDateTime())"
    >
      Use
    </button>
  `,
  styles: ``,
})
export class SkillListItemUi {
  /** 現在日時 */
  readonly currentDateTime = input.required<LocalDateTime>();
  /** スキル */
  readonly skill = input.required<Skill>();
  /** スキルが使用された */
  readonly useSkill = output<UseSkillEvent>();
  /** スキルが選択された */
  readonly selectSkill = output<SkillId>();
  /** スキルロジック */
  readonly skillLogic = skillLogic;

  /**
   * スキルを使用します。
   */
  emitUseSkill(): void {
    const useSkillEvent = zodParse(UseSkillEvent, {
      skillId: this.skill().id,
      usedAt: this.currentDateTime(),
    });
    this.useSkill.emit(useSkillEvent);
  }

  /**
   * スキルを選択します。
   */
  emitSelectSkill(): void {
    this.selectSkill.emit(this.skill().id);
  }
}
