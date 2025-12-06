import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import {
  CreateSkillFormUi,
  CreateSkillSubmission,
} from './controller/gui/skill/create-skill-form.ui';
import { SkillListUi } from './controller/gui/skill/skill-list.ui';
import { RefreshCastingChargeEvent, UseSkillEvent } from './feature/skill/domain/event/skill-event';
import { SkillId } from './feature/skill/domain/skill';
import { SKILL_MUTATOR, SKILL_READER } from './feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from './util/current-date-time-provider';
import { zodParse } from './util/zod';

// TODO ルーティングの設定する

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateSkillFormUi, SkillListUi],
  template: `
    <app-create-skill-form (createSkill)="createSkill($event)"></app-create-skill-form>
    <app-skill-list
      [currentDateTime]="currentDateTime()"
      [skills]="skills()"
      (useSkill)="useSkill($event)"
    ></app-skill-list>

    <router-outlet />
  `,
  styles: [],
})
export class App {
  readonly currentDateTime = inject(CURRENT_DATE_TIME);
  readonly skillReader = inject(SKILL_READER);
  readonly skillMutator = inject(SKILL_MUTATOR);
  readonly skills = this.skillReader.skills();

  constructor() {
    // TODO サービスにうつす
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

  useSkill(skillId: SkillId): void {
    const useSkillEvent = zodParse(UseSkillEvent, { skillId });
    this.skillMutator.handleUseSkillEvent(useSkillEvent);
  }
}
