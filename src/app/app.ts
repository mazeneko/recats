import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import {
  CreateSkillFormUi,
  CreateSkillSubmission,
} from './controller/gui/skill/create-skill-form.ui';
import { skillLogic } from './feature/skill/domain';
import { RefreshCastingChargeEvent, UseSkillEvent } from './feature/skill/domain/event/skill-event';
import { Skill } from './feature/skill/domain/skill';
import { SKILL_MUTATOR, SKILL_READER } from './feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from './util/current-date-time-provider';
import { zodParse } from './util/zod';

// TODO ルーティングの設定する

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateSkillFormUi],
  template: `
    <app-create-skill-form (createSkill)="createSkill($event)"></app-create-skill-form>

    <h1>Skills</h1>
    <div class="flex flex-col gap-4">
      @for (skill of skills(); track skill.id) {
        <div class="ml-4">
          <h3>name: {{ skill.name }}</h3>
          <p>lastUsedAt: {{ skill.lastUsedAt ?? 'not used' }}</p>
          <p>recastAt: {{ skillLogic.recastAt(skill) ?? 'none' }}</p>
          <p>untilReady: {{ skillLogic.untilRecast(skill, currentDateTime()) ?? 'infinity' }}</p>
          <p>charge: {{ skill.castingCharge }}</p>
          <button type="button" (click)="useSkill(skill)" [disabled]="!skillLogic.hasCharge(skill)">
            Use
          </button>
        </div>
      }
    </div>

    <router-outlet />
  `,
  styles: [],
})
export class App {
  readonly currentDateTime = inject(CURRENT_DATE_TIME);
  readonly skillReader = inject(SKILL_READER);
  readonly skillMutator = inject(SKILL_MUTATOR);
  readonly skills = this.skillReader.skills();
  readonly skillLogic = skillLogic;

  constructor() {
    toObservable(this.currentDateTime).subscribe((now) =>
      this.skillMutator.handleRefreshCastingChargeEvent(
        zodParse(RefreshCastingChargeEvent, { now }),
      ),
    );
  }

  createSkill(submission: CreateSkillSubmission) {
    this.skillMutator.handleCreateSkillEvent(submission.createSkillEvent);
    submission.resetForm();
  }

  useSkill(skill: Skill): void {
    if (!skillLogic.hasCharge(skill)) {
      console.warn('チャージがありません。');
      return;
    }
    const useSkillEvent = zodParse(UseSkillEvent, { skillId: skill.id });
    this.skillMutator.handleUseSkillEvent(useSkillEvent);
  }
}
