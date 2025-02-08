/**
 * ValueObjectを作るための抽象クラスです。
 * @template T 保持している値の型
 */
export abstract class ValueObject<T> {
  abstract readonly value: T;
  /**
   * {@link Object.prototype.toString}を参照してください。
   */
  abstract toString(): string;
  /**
   * {@link Object.prototype.valueOf}を参照してください。
   */
  valueOf(): T {
    return this.value;
  }
  /**
   * 値が等しければtrueを返します。
   * @param other 別のValueObject
   * @return 値が等しければtrue
   */
  abstract equals(other: ValueObject<T>): boolean;
}

/**
 * 値がルールに違反していると例外を投げる関数を使ってバリデーションをするためのヘルパーです。
 * @template T 検査する値の型
 * @param value 値
 * @param ensureValueOrThrow 値がルールに違反していると例外を投げる関数
 * @returns 値がルール通りならtrue
 */
export function isValid<T>(
  value: T,
  ensureValueOrThrow: (value: T) => unknown,
) {
  try {
    ensureValueOrThrow(value);
    return true;
  } catch (error) {
    return false;
  }
}
