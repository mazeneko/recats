import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Duration } from '@js-joda/core';

import { Recast } from '../../domain/recast';
import { Skill } from '../../domain/skill';
import {
  CreateSkillEvent,
  SkillCommand,
} from '../../service/skill-command.service';

export interface CreateSkillDialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-create-skill-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>create skill</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>name</mat-label>
        <input matInput [(ngModel)]="name" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>seconds</mat-label>
        <input type="number" step="1" matInput [(ngModel)]="seconds" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="cancel()">cancel</button>
      <button mat-button (click)="createSkill()" cdkFocusInitial>create</button>
    </mat-dialog-actions>
  `,
  styles: ``,
})
export class CreateSkillDialog {
  readonly dialogRef = inject<
    MatDialogRef<CreateSkillDialog, Skill | undefined>
  >(MatDialogRef<CreateSkillDialog>);

  readonly skillCommand = inject(SkillCommand);
  readonly name = signal('');
  readonly seconds = signal(10);

  cancel() {
    this.dialogRef.close();
  }

  async createSkill() {
    const createSkillEvent = new CreateSkillEvent(
      new Skill.Name(this.name()),
      new Recast.TimeRecast(Duration.ofSeconds(this.seconds())),
    );
    const skill = await this.skillCommand.createSkill(createSkillEvent);
    this.dialogRef.close(skill);
  }
}
