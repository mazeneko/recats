import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

/**
 * フォームフィールドのエラー表示
 */
@Component({
  selector: 'app-field-errors',
  imports: [],
  template: `
    @if (fieldState().touched() && fieldState().invalid()) {
      <ul>
        @for (error of fieldState().errors(); track $index) {
          <li class="text-xs text-red-500">{{ error.message }}</li>
        }
      </ul>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorsUi<T> {
  /** フィールドのステータス */
  readonly fieldState = input.required<FieldState<T>>();
}
