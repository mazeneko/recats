import { Component, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-skills-card-button',
  imports: [MatCardModule],
  template: `
    <mat-card
      appearance="outlined"
      class="aspect-square cursor-pointer transition select-none hover:brightness-90"
      (click)="triggered.emit($event)"
      (keydown.space)="triggered.emit($event)"
      [tabIndex]="0"
    >
      <mat-card-content class="h-full">
        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  `,
})
export class CardButtonComponent {
  readonly triggered = output<MouseEvent | Event>();
}
