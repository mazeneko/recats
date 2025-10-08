import z from 'zod';
import { ja } from 'zod/locales';

/**
 * 型の単位
 */
const Units: Record<string, string | undefined> = {
  string: '文字',
  file: 'バイト',
  array: '要素',
  set: '要素',
};

/**
 * zodのメッセージを設定します。
 */
export function configZodMessage(): void {
  // Zodのロケールを日本語にします。
  z.config(ja());
  // Zodのメッセージを画面の入力エラーとして使う時にわかりやすいようにカスタマイズします。
  z.config({
    customError: (issue) => {
      if (issue.code === 'invalid_type') {
        if (issue.expected === 'number') return '数値を入力してください';
        if (issue.expected === 'bigint') return '数値を入力してください';
        if (issue.expected === 'int') return '整数を入力してください';
        if (issue.expected === 'date') return '日付を入力してください';
        return null;
      }
      if (issue.code === 'too_big') {
        return `${issue.maximum}${Units[issue.origin] ?? ''}${issue.inclusive ? '以下に' : 'より小さく'}してください`;
      }
      if (issue.code === 'too_small') {
        return `${issue.minimum}${Units[issue.origin] ?? ''}${issue.inclusive ? '以上に' : 'より大きく'}してください`;
      }
      return null;
    },
  });
}
