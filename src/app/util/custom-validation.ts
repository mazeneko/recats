import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { z } from 'zod';

import { zodUnknownParse } from './zod';

/**
 * カスタムバリデーションエラーの種類
 */
export const CustomValidationErrorType = z.enum([
  /** Zodの型チェックでバリデーションエラーになったとき */
  'zodType',
]);
export type CustomValidationErrorType = z.output<typeof CustomValidationErrorType>;

/**
 * カスタムバリデーションエラーが起こった時の結果
 */
export const CustomValidationErrorMessagesBrand = Symbol();
export const CustomValidationErrorMessages = z
  .string()
  .nonempty()
  .array()
  .nonempty()
  .brand<typeof CustomValidationErrorMessagesBrand>();
export type CustomValidationErrorMessages = z.output<typeof CustomValidationErrorMessages>;

/**
 * カスタムバリデーションエラー
 */
export type CustomValidationErrors = Partial<
  Record<CustomValidationErrorType, CustomValidationErrorMessages>
>;

/**
 * カスタムバリデーションエラーのメッセージを１つにまとめるパイプ
 */
@Pipe({ name: 'customValidationErrors' })
export class CustomValidationErrorsPipe implements PipeTransform {
  transform(value: ValidationErrors | null): string[] {
    return CustomValidationErrorType.options
      .map((errorType) => value?.[errorType])
      .filter((content) => content != null)
      .flatMap((content) => zodUnknownParse(CustomValidationErrorMessages, content));
  }
}
