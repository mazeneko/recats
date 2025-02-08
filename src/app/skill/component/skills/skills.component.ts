import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';

import { Skill } from '../../domain/skill';
import { CastCommand, CastEvent } from '../../service/cast-command.service';
import {
  CastQuery,
  LatestCastingSummary,
} from '../../service/cast-query.service';
import { SkillQuery } from '../../service/skill-query.service';
import { CreateSkillDialog } from '../create-skill-dialog/create-skill-dialog.component';
import { CardButtonComponent } from './skills-card-button.component';

interface ViewItem {
  readonly skill: Skill;
  readonly latestCastedTime: LocalDateTime | undefined;
}

@Component({
  selector: 'app-skills',
  imports: [MatIconModule, CardButtonComponent],
  template: `
    <div
      class="grid grid-cols-[repeat(auto-fit,170px)] place-content-center gap-4"
    >
      @for (item of viewItems(); track $index) {
        <app-skills-card-button (triggered)="castNow(item.skill.id)">
          <p>{{ item.skill.name }}</p>
          <p class="text-xs">
            {{ item.latestCastedTime?.format(castedTimeFormatter) }}
          </p>
        </app-skills-card-button>
      }
      <app-skills-card-button (click)="openDialog()">
        <div class="grid h-full place-content-center">
          <mat-icon fontIcon="add" [inline]="true"></mat-icon>
        </div>
      </app-skills-card-button>
    </div>
  `,
})
export class SkillsComponent implements OnInit {
  readonly skillQuery = inject(SkillQuery);
  readonly skills = signal<Skill[]>([]);
  readonly loading = signal<boolean>(false);

  readonly castCommand = inject(CastCommand);
  readonly castQuery = inject(CastQuery);
  readonly latestCastingSummary = signal<LatestCastingSummary | null>(null);

  readonly dialog = inject(MatDialog);

  readonly viewItems = computed<ViewItem[]>(() => {
    const summary = this.latestCastingSummary();
    return this.skills().map((skill) => ({
      skill,
      latestCastedTime: summary?.getLatestCastedTime(skill.id),
    }));
  });

  readonly castedTimeFormatter = DateTimeFormatter.ofPattern(
    'uuuu-MM-dd HH:mm:ss.SSS',
  );

  castNow(skillId: string): void {
    console.log(skillId);
    this.castCommand
      .addEvent(new CastEvent(skillId, LocalDateTime.now()))
      .then(() => this.loadSkills());
  }

  ngOnInit(): void {
    this.loadSkills();
  }
  loadSkills(): void {
    if (this.loading()) {
      console.warn('already loading');
      return;
    }
    this.loading.set(true);
    this.skillQuery.getSkills().then((skills) => {
      this.skills.set(skills);
      this.loading.set(false);
    });
    this.castQuery.getLatestCastingSummary().then((summary) => {
      this.latestCastingSummary.set(summary);
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateSkillDialog);
    dialogRef.afterClosed().subscribe(() => this.loadSkills());
  }
}
