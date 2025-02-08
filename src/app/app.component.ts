import { Component, inject, OnInit } from '@angular/core';

import { AccountComponent } from './account/account.component';
import { AuthComponent } from './auth/auth.component';
import { SkillsComponent } from './skill/component/skills/skills.component';
import { SupabaseService } from './supabase.service';
import { CURRENT_DATE_TIME } from './util/current-date-time-provider.service';

@Component({
  selector: 'app-root',
  imports: [SkillsComponent, AuthComponent, AccountComponent],
  template: `
    @if (session) {
      <app-account [session]="session"></app-account>
    } @else {
      <app-auth></app-auth>
    }
    <div class="grid min-h-dvh items-center">
      <app-skills></app-skills>
    </div>
  `,
})
export class AppComponent implements OnInit {
  supabase = inject(SupabaseService);
  session = this.supabase.session;

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
