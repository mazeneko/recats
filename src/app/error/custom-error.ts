/**
 * カスタムエラー
 */
export class CustomError extends Error {
  constructor(
    /** メッセージ。ユーザーに表示されます。 */
    message: string,
    /** カスタムエラーごとに固有のデータ */
    public readonly detail: CustomErrorDetail,
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
export type CustomErrorDetail = ExampleError | ExampleError2;

export type ExampleError = {
  readonly errorCode: 'ExampleError';
};

export type ExampleError2 = {
  readonly errorCode: 'ExampleError2';
  readonly amount: number;
};
