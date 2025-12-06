import { SkillId } from '../feature/skill/domain/skill';

/**
 * カスタムエラー
 */
export class CustomError extends Error {
  constructor(
    /** メッセージ。ユーザーに表示されます。 */
    message: string,
    /** カスタムエラーごとに固有のデータ */
    readonly detail: CustomErrorDetail,
    /** エラーオプション。 */
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

/**
 * カスタムエラーごとに固有のデータ
 *
 * ここに含まれる型には他と重複しないようなerrorCodeを含み、エラーを判別できるようにしてください。
 */
export type CustomErrorDetail = SkillNotFoundError | OutOfChargeError;

/**
 * スキルが見つからなかったときのエラー
 */
export type SkillNotFoundError = {
  readonly errorCode: 'SkillNotFoundError';
  readonly skillId: SkillId;
};

/**
 * スキルのチャージがないときのエラー
 */
export type OutOfChargeError = {
  readonly errorCode: 'OutOfChargeError';
  readonly skillId: SkillId;
};
