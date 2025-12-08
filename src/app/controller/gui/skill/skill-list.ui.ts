import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LocalDateTime } from '@js-joda/core';

import {
  AddChargeEvent,
  DeleteSkillEvent,
  UseSkillEvent,
} from '../../../feature/skill/domain/event/skill-event';
import { Skill } from '../../../feature/skill/domain/skill';
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
          (addCharge)="emitAddCharge($event)"
          (deleteSkill)="emitDeleteSkill($event)"
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
  readonly useSkill = output<UseSkillEvent>();
  /** チャージが追加された */
  readonly addCharge = output<AddChargeEvent>();
  /** チャージが削除された */
  readonly deleteSkill = output<DeleteSkillEvent>();

  /**
   * スキルを使用します。
   * @param useSkillEvent スキル使用イベント
   */
  emitUseSkill(useSkillEvent: UseSkillEvent): void {
    this.useSkill.emit(useSkillEvent);
  }

  /**
   * チャージを追加します。
   * @param addChargeEvent チャージ追加イベント
   */
  emitAddCharge(addChargeEvent: AddChargeEvent): void {
    this.addCharge.emit(addChargeEvent);
  }

  /**
   * スキルを削除します。
   * @param deleteSkillEvent スキル削除イベント
   */
  emitDeleteSkill(deleteSkillEvent: DeleteSkillEvent): void {
    this.deleteSkill.emit(deleteSkillEvent);
  }
}
