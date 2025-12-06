import { required, SchemaPath, validate, ValidationError } from '@angular/forms/signals';
import z from 'zod';

import { zodSafeParse } from './zod';

/**
 * Signal Formsのフォームを作るときに使うスキーマです。
 *
 * いまのところSignal Formsでは、
 * - 文字列の未入力 -> 空文字
 * - 数値の未入力 -> Nan
 * となっていますが、
 * 任意項目の場合はnullに変換されるようにしています。
 */
export const zodFormField = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  optional: {
    string: z.string().transform((value) => (value === '' ? null : value)),
    number: z
      .union([z.number(), z.nan()])
      .transform((value) => (Number.isNaN(value) ? null : value)),
  },
};

/**
 * zodのスキーマでフォームフィールドを検証します。
 * @param zodType zodのスキーマ
 * @param field フォームフィールド
 * @param options オプション
 */
export function zodValidate<T extends z.ZodType>(
  zodType: T,
  field: SchemaPath<z.input<T>>,
  options?: {
    /** 必須。デフォルトは`true` */
    required?: boolean;
    /** 必須エラーのメッセージ。デフォルトは`入力してください。` */
    requiredMessage?: string;
  },
) {
  // 必須チェックをします。
  required(field, {
    message: options?.requiredMessage ?? '入力してください。',
    when: () => options?.required ?? true,
  });
  // zodのスキーマで検証します。
  validate(field, (context) => {
    const value = context.value();
    // 空の場合はOKとします。空からどうかはzodFormFieldの判定と合わせています。
    const empty = value === '' || Number.isNaN(value);
    if (empty) {
      return null;
    }
    // パースをしてみて成功すればOKです。
    const parsed = zodSafeParse(zodType, value);
    if (parsed.success) {
      return null;
    }
    // パースに失敗した場合はzodのエラーメッセージをバリデーションエラーメッセージとします。
    return parsed.error.issues.map<ValidationError>((issue) => ({
      kind: 'zod',
      message: issue.message,
    }));
  });
}
