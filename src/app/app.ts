import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SkillPageUi } from './controller/gui/skill/skill-page.ui';

// TODO ルーティングの設定する

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SkillPageUi],
  template: `
    <app-skill-page></app-skill-page>

    <router-outlet />
  `,
  styles: [],
})
export class App {}
