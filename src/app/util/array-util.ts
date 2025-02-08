/**
 * 配列の要素に重複があればtrueを返します。
 * @template T 配列要素の型
 * @template KEY 重複の判定に使うキーの型
 * @param items 配列
 * @param keySelector 重複の判定に使うキーのセレクター
 * @returns 配列の要素に重複があればtrue
 */
export function hasDuplicates<T, KEY>(
  items: T[],
  keySelector: (item: T) => KEY,
): boolean {
  return extractDuplicates(items, keySelector).size > 0;
}

/**
 * 配列の要素のうち重複している要素を抽出します。
 * @template T 配列要素の型
 * @template KEY 重複の判定に使うキーの型
 * @param items 配列
 * @param keySelector 重複の判定に使うキーのセレクター
 * @returns 重複していた要素だけが含まれるMap
 */
export function extractDuplicates<T, KEY>(
  items: T[],
  keySelector: (item: T) => KEY,
): Map<KEY, T[]> {
  const keyGroups = Map.groupBy(items, keySelector);
  const duplicatedEntries = Array.from(keyGroups.entries()).filter(
    ([key, group]) => group.length != 1,
  );
  return new Map(duplicatedEntries);
}

/**
 * 配列の要素のうち重複している要素のキーを抽出します。
 * @template T 配列要素の型
 * @template KEY 重複の判定に使うキーの型
 * @param items 配列
 * @param keySelector 重複の判定に使うキーのセレクター
 * @returns 重複していたキーの配列
 */
export function extractDuplicateKeys<T, KEY>(
  items: T[],
  keySelector: (item: T) => KEY,
): KEY[] {
  return Array.from(extractDuplicates(items, keySelector).keys());
}
