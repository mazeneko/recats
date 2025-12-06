import { FocusAfterNavigation } from '../controller/gui/parts/focus-after-navigation';

/**
 * 開発ミスが原因のエラー
 */
export class DevelopmentError extends Error {
  constructor(
    /** メッセージ */
    message: string,
    /** 開発エラーごとに固有のデータ */
    readonly detail: DevelopmentErrorDetail,
    /** エラーオプション。 */
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

/**
 * 開発エラーごとに固有のデータ
 *
 * ここに含まれる型には他と重複しないようなerrorCodeを含み、エラーを判別できるようにしてください。
 */
export type DevelopmentErrorDetail = FocusAfterNavigationTargetMistake | FormDefinitionMistake;

/**
 * {@link FocusAfterNavigation}の対象がHTMLElementになっていないミス
 *
 */
export type FocusAfterNavigationTargetMistake = {
  readonly errorCode: 'FocusAfterNavigationTargetMistake';
};

/**
 * フォームの定義ミス
 *
 * なんらかの値を作るためにフォームを定義しているとき、
 * フォームがvalidになっているのに目的の値が作成できなかった場合に使用します。
 */
export type FormDefinitionMistake = {
  readonly errorCode: 'FormDefinitionMistake';
  readonly formValue: unknown;
};
