import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { skillLogic } from '../../../feature/skill/domain';
import {
  AddChargeEvent,
  DeleteSkillEvent,
  UseSkillEvent,
} from '../../../feature/skill/domain/event/skill-event';
import { Skill } from '../../../feature/skill/domain/skill';
import { zodParse } from '../../../util/zod';

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
    <button type="button" (click)="emitAddCharge()" [disabled]="skillLogic.isFullCharged(skill())">
      Add
    </button>
    <button type="button" (click)="emitDeleteSkill()">Delete</button>
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
  readonly useSkill = output<UseSkillEvent>();
  /** チャージが追加された */
  readonly addCharge = output<AddChargeEvent>();
  /** チャージが削除された */
  readonly deleteSkill = output<DeleteSkillEvent>();
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
   * チャージを追加します。
   */
  emitAddCharge(): void {
    const addChargeEvent = zodParse(AddChargeEvent, {
      skillId: this.skill().id,
    });
    this.addCharge.emit(addChargeEvent);
  }

  /**
   * スキルを削除します。
   */
  emitDeleteSkill(): void {
    const deleteSkillEvent = zodParse(DeleteSkillEvent, {
      skillId: this.skill().id,
    });
    this.deleteSkill.emit(deleteSkillEvent);
  }
}
