import { Component, computed, inject, signal } from '@angular/core';

import {
  AddChargeEvent,
  DeleteSkillEvent,
  UseSkillEvent,
} from '../../../feature/skill/domain/event/skill-event';
import { SkillId } from '../../../feature/skill/domain/skill';
import { SKILL_MUTATOR, SKILL_READER } from '../../../feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from '../../../util/current-date-time-provider';
import { CreateSkillFormUi } from './create-skill-form.ui';
import { SkillDetailUi } from './skill-detail.ui';
import { SkillListUi } from './skill-list.ui';

/**
 * スキルページ
 */
@Component({
  selector: 'app-skill-page',
  imports: [CreateSkillFormUi, SkillListUi, SkillDetailUi],
  template: `
    <div class="flex h-full place-content-between">
      <div class="flex h-full grow flex-col gap-8 overflow-auto">
        <app-create-skill-form
          #createSkillFormUi
          (skillCreated)="createSkillFormUi.resetByDefault()"
        ></app-create-skill-form>
        <app-skill-list
          [currentDateTime]="currentDateTime()"
          [skills]="skills()"
          (useSkill)="useSkill($event)"
          (selectSkill)="toggleSelectSkill($event)"
        ></app-skill-list>
      </div>
      @if (selectedSkill(); as selectedSkill) {
        <div class="h-full overflow-auto">
          <app-skill-detail
            [currentDateTime]="currentDateTime()"
            [skill]="selectedSkill"
            (useSkill)="useSkill($event)"
            (addCharge)="addCharge($event)"
            (deleteSkill)="deleteSkill($event)"
            (selectSkill)="toggleSelectSkill($event)"
          ></app-skill-detail>
        </div>
      }
    </div>
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
  readonly selectedSkillId = signal<SkillId | null>(null);
  readonly selectedSkill = computed(() => {
    const selectedSkillId = this.selectedSkillId();
    if (selectedSkillId == null) {
      return null;
    }
    return this.skills().find((skill) => skill.id === selectedSkillId) ?? null;
  });

  /**
   * スキルを使用します。
   * @param useSkillEvent スキル使用イベント
   */
  async useSkill(useSkillEvent: UseSkillEvent): Promise<void> {
    await this.skillMutator.handleUseSkillEvent(useSkillEvent);
  }

  /**
   * チャージを追加します。
   * @param addChargeEvent チャージ追加イベント
   */
  async addCharge(addChargeEvent: AddChargeEvent): Promise<void> {
    await this.skillMutator.handleAddChargeEvent(addChargeEvent);
  }

  /**
   * スキルを使用します。
   * @param deleteSkillEvent スキル使用イベント
   */
  async deleteSkill(deleteSkillEvent: DeleteSkillEvent): Promise<void> {
    await this.skillMutator.handleDeleteSkillEvent(deleteSkillEvent);
  }

  /**
   * スキルの選択をトグルします。
   * @param skillId スキルID
   */
  async toggleSelectSkill(skillId: SkillId): Promise<void> {
    this.selectedSkillId.update((current) => (current == skillId ? null : skillId));
  }
}
