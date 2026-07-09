import { Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import { JsonPipe } from '@angular/common';
import { skillLogic } from '../../../feature/skill/domain';
import {
  AddChargeEvent,
  DeleteSkillEvent,
  UseSkillEvent,
} from '../../../feature/skill/domain/event/skill-event';
import { Skill, SkillId } from '../../../feature/skill/domain/skill';
import { zodParse } from '../../../util/zod';

/**
 * スキルの詳細
 */
@Component({
  selector: 'app-skill-detail',
  imports: [JsonPipe],
  template: `
    <h3 (click)="emitSelectSkill()">name: {{ skill().name }}</h3>
    <p>lastUsedAt: {{ skill().lastUsedAt ?? 'not used' }}</p>
    <p>
      chargedAt:
      {{ skillLogic.pickNextScheduledCharge(skill(), currentDateTime())?.completedAt ?? 'none' }}
    </p>
    <p>untilCharge: {{ skillLogic.untilNextCharge(skill(), currentDateTime()) ?? 'infinity' }}</p>
    <p>progress: {{ skillLogic.getNextChargeProgress(skill(), currentDateTime()) ?? 'none' }}</p>
    <p>
      charges: {{ skillLogic.countCharges(skill(), currentDateTime()) }} /
      {{ skill().chargeLimit }}
    </p>
    <details>
      <summary>chargeSchedules:</summary>
      <ul>
        @for (timing of skill().chargeSchedules; track $index) {
          <li>{{ timing.recastFrom }} ~ {{ timing.completedAt }}</li>
        }
      </ul>
    </details>
    <p>otherCharges: {{ skill().otherCharges }}</p>
    <button
      type="button"
      (click)="emitUseSkill()"
      [disabled]="!skillLogic.hasCharge(skill(), currentDateTime())"
    >
      Use
    </button>
    <button
      type="button"
      (click)="emitAddCharge()"
      [disabled]="skillLogic.hasFullCharges(skill(), currentDateTime())"
    >
      Add
    </button>
    <button type="button" (click)="emitDeleteSkill()">Delete</button>
    <pre>{{ skill() | json }}</pre>
  `,
  styles: ``,
})
export class SkillDetailUi {
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
   * チャージを追加します。
   */
  emitAddCharge(): void {
    const addChargeEvent = zodParse(AddChargeEvent, {
      skillId: this.skill().id,
      addedAt: this.currentDateTime(),
    });
    this.addCharge.emit(addChargeEvent);
  }

  /**
   * スキルを削除します。
   */
  emitDeleteSkill(): void {
    const deleteSkillEvent = zodParse(DeleteSkillEvent, {
      skillId: this.skill().id,
      deletedAt: this.currentDateTime(),
    });
    this.deleteSkill.emit(deleteSkillEvent);
  }

  /**
   * スキルを選択します。
   */
  emitSelectSkill(): void {
    this.selectSkill.emit(this.skill().id);
  }
}
