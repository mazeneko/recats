import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormControlOptions,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import z from 'zod';
import { CustomValidationErrorMessages, CustomValidationErrors } from './custom-validation';
import { zodParse } from './zod';

/**
 * {@link zodTypeValidator}のオプション
 */
export type ZodTypeValidationOptions = {
  /** オプションの入力項目である */
  optional?: boolean;
};

/**
 * AngularのFormでzodの検証をするためのValidator
 *
 * zodのparseに失敗した場合、invalidとなります。
 *
 * invalidな場合は`zodType`という名前で`ValidationErrors`を登録します。
 * このエラーにはユーザーに見せられるメッセージのリストが含まれています。
 *
 * メッセージにはzodのエラーメッセージが設定されます。
 *
 * @param zodType zodの型
 * @param opts バリデーションのオプション
 * @returns ValidatorFn
 * @template T zodの型
 */
export function zodTypeValidator<T extends z.ZodType>(
  zodType: T,
  opts: ZodTypeValidationOptions = {},
): ValidatorFn {
  return (control: AbstractControl): CustomValidationErrors | null => {
    const value = zodType.safeParse(control.value);
    if (value.success) {
      return null;
    }
    if (control.value == null) {
      const optional = opts.optional ?? false;
      return optional
        ? null
        : {
            zodType: zodParse(CustomValidationErrorMessages, ['入力してください']),
          };
    }
    return {
      zodType: zodParse(
        CustomValidationErrorMessages,
        value.error.issues.map((issue) => issue.message),
      ),
    };
  };
}

/**
 * Zodのスキーマに基づいたバリデーションを行うAngularのFormControlを作成します。
 *
 * - zodによる型バリデーションを行います。
 * - `optional` オプションが無効な場合、自動でValidators.requiredを追加します。
 * - `optional` オプションが有効な場合、空文字（""）を null に自動変換します。
 * - 他のバリデータを追加したい場合は `opts` 経由で指定できます。
 *
 * @param zodType 検証に使うzodスキーマ
 * @param value 初期値（zodスキーマに適合する値またはnull）
 * @param opts AngularのFormControlオプション＋`optional`の独自オプション
 * @returns Zodのバリデーション付きFormControl
 */
export function zodTypeFormControl<T extends z.ZodType>(
  zodType: T,
  value: z.input<T> | null,
  opts: FormControlOptions & { optional: true },
): FormControl<z.input<T> | null>;
export function zodTypeFormControl<T extends z.ZodType>(
  zodType: T,
  value: z.input<T> | null,
  opts?: FormControlOptions & { optional?: false },
): FormControl<z.input<T>>;
export function zodTypeFormControl<T extends z.ZodType>(
  zodType: T,
  value: z.input<T> | null,
  opts: FormControlOptions & ZodTypeValidationOptions = {},
): FormControl<z.input<T> | null> {
  const { validators, optional, ...restOpts } = opts;
  // validatorsがnullだったり関数だったり配列だったりするので配列の形に一般化します。
  const normalizedValidators =
    validators == null ? [] : Array.isArray(validators) ? validators : [validators];
  // 渡されたオプションを拡張してコントロールを作ります。
  const preValidators = (optional ?? false) ? [] : [Validators.required];
  const postValidators = [zodTypeValidator(zodType, { optional })];
  const formControl = new FormControl(value, {
    validators: [...preValidators, ...normalizedValidators, ...postValidators],
    ...restOpts,
  });
  // optionalな場合は自動で空文字をnullに置き換えるようにします。
  if (optional) {
    formControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value === '') {
        formControl.setValue(null);
      }
    });
  }
  return formControl;
}
