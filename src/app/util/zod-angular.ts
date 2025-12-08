import { required, SchemaPath, validate, ValidationError } from '@angular/forms/signals';
import z from 'zod';

import { zodUnknownSafeParse } from './zod';

/** 文字列フィールド */
const StringField = z.string();
/** 数値フィールド */
const NumberField = z.union([z.number(), z.nan()]);
/** 真偽値フィールド */
const BooleanField = z.boolean();

/** 文字列フィールド(未入力はnullへ変換) */
const StringFieldWithNull = StringField.transform((value) => (value === '' ? null : value));
/** 数値フィールド(未入力はnullへ変換) */
const NumberFieldWithNull = NumberField.transform((value) => (Number.isNaN(value) ? null : value));

/**
 * 文字列フィールドのスキーマを作ります。
 * @param options オプション
 * @returns スキーマ
 */
function stringField(options: { required: false }): typeof StringFieldWithNull;
function stringField(options?: { required: true }): typeof StringField;
function stringField(options: { required: boolean } = { required: true }) {
  if (options.required) {
    return StringField;
  } else {
    return StringFieldWithNull;
  }
}

/**
 * 数値フィールドのスキーマを作ります。
 * @param options オプション
 * @returns スキーマ
 */
function numberField(options: { required: false }): typeof NumberFieldWithNull;
function numberField(options?: { required: true }): typeof NumberField;
function numberField(options: { required: boolean } = { required: true }) {
  if (options.required) {
    return NumberField;
  } else {
    return NumberFieldWithNull;
  }
}

/**
 * 真偽値フィールドのスキーマを作ります。
 * @returns スキーマ
 */
function booleanField() {
  return BooleanField;
}

/**
 * Signal Formsのフォームを作るときに使うスキーマです。
 */
export const zodFormField = {
  string: stringField,
  number: numberField,
  boolean: booleanField,
} as const;

/**
 * zodのスキーマでフォームフィールドを検証します。
 * @param zodType zodのスキーマ
 * @param field フォームフィールド
 * @param options オプション
 */
export function zodValidate<T extends z.ZodType<O, I>, O, I extends string | number | boolean>(
  zodType: T,
  field: SchemaPath<I>,
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
    const parsed = zodUnknownSafeParse(zodType, value as unknown);
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
