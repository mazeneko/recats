import { z, ZodType } from 'zod';
import {
  $InferInnerFunctionType,
  $InferInnerFunctionTypeAsync,
  $ZodFunctionIn,
  $ZodFunctionOut,
} from 'zod/v4/core';

/**
 * zodのparseの引数の型を適切にするためのユーティリティです。
 * parseは引数の型がunknownになっておりなんでも受け入れてしまうので型を付けています。
 * @param schema parseに使うZodType
 * @param data parseに渡すデータ
 * @returns parseの戻り値
 */
export function zodTypeSafeParse<T extends ZodType>(schema: T, data: z.input<T>): z.output<T> {
  return schema.parse(data);
}

/**
 * Unknownだけを許容するための型です。
 */
export type OnlyUnknown<DUMMY> = unknown extends DUMMY ? DUMMY : never;

/**
 * {@link zodTypeSafeParse}と対になるように用意している、型がわからない値のためのparseです。
 * unknown以外は渡せないようにしてあります。
 * @param schema parseに使うZodType
 * @param data parseに渡すデータ
 * @returns parseの戻り値
 */
export function zodUnknownParse<T extends ZodType, DUMMY>(
  schema: T,
  data: OnlyUnknown<DUMMY>,
): z.output<T> {
  return schema.parse(data);
}

/**
 * zodの関数スキーマを作ります。
 * https://github.com/colinhacks/zod/issues/4143#issuecomment-2845134912
 */
export function zodFunction<T extends z.core.$ZodFunction>(schema: T) {
  return z.custom<Parameters<T['implement']>[0]>((fn) =>
    schema.implement(fn as $InferInnerFunctionType<$ZodFunctionIn, $ZodFunctionOut>),
  );
}

/**
 * zodの非同期関数スキーマを作ります。
 * https://github.com/colinhacks/zod/issues/4143#issuecomment-2845134912
 */
export function zodAsyncFunction<T extends z.core.$ZodFunction>(schema: T) {
  return z.custom<Parameters<T['implementAsync']>[0]>((fn) =>
    schema.implementAsync(fn as $InferInnerFunctionTypeAsync<$ZodFunctionIn, $ZodFunctionOut>),
  );
}
