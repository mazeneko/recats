import { Component, inject } from '@angular/core';

import { SkillsComponent } from './skill/component/skills/skills.component';
import { CURRENT_DATE_TIME } from './util/current-date-time-provider.service';

@Component({
  selector: 'app-root',
  imports: [SkillsComponent],
  template: `
    <div class="grid min-h-dvh items-center">
      <app-skills></app-skills>
    </div>
  `,
})
export class AppComponent {}
