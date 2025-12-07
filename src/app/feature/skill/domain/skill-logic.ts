import { Duration, LocalDateTime } from '@js-joda/core';

import { recastLogic } from '.';
import { zodParse } from '../../../util/zod';
import { CreateSkillEvent } from './event/skill-event';
import { RecastingFrom } from './recast';
import { Skill, SkillCreatedAt, SkillUsedAt } from './skill';

/**
 * スキルを作成します。
 * @param event スキルを作成するイベント
 * @param createdAt 作成日時
 * @returns 作成したスキル
 */
export function createSkill(event: CreateSkillEvent, createdAt: SkillCreatedAt): Skill {
  return zodParse(Skill, {
    id: crypto.randomUUID(),
    name: event.name,
    createdAt,
    lastUsedAt: null,
    castingCharge: event.initiallyAvailable ? 1 : 0,
    castingChargeLimit: event.castingChargeLimit,
    recast: event.recast,
    recastingFrom: createdAt,
  });
}

/**
 * 未使用ならtrueを返します。
 * @param skill スキル
 * @returns 未使用ならtrue
 */
export function isUnused(skill: Skill): boolean {
  return skill.lastUsedAt === null;
}

/**
 * チャージがあればtrueを返します。
 * @param skill スキル
 * @return チャージがあればtrue
 */
export function hasCharge(skill: Skill): boolean {
  return 0 < skill.castingCharge;
}

/**
 * 最大チャージならtrueを返します。
 * @param skill スキル
 * @returns 最大チャージならtrue
 */
export function isFullCharged(skill: Skill): boolean {
  return skill.castingChargeLimit <= skill.castingCharge;
}

/**
 * 時間の経過でリキャストするならtrueを返します。
 * @param skill スキル
 * @returns 時間の経過でリキャストするならtrue
 */
export function willRecastOverTime(skill: Skill): boolean {
  if (isFullCharged(skill)) {
    return false;
  }
  return recastLogic.isTimeBased(skill.recast);
}

/**
 * リキャスト完了日時を取得します。
 * @param skill スキル
 * @return リキャスト完了日時。リキャストの予定がない場合はnull。
 */
export function recastAt(skill: Skill): LocalDateTime | null {
  if (!recastLogic.isTimeBased(skill.recast)) {
    return null;
  }
  if (isFullCharged(skill)) {
    return null;
  }
  return recastLogic.readyAt(skill.recast, skill.recastingFrom);
}

/**
 * リキャスト完了までの時間を取得します。
 * @param skill スキル
 * @param now 現在日時
 * @returns リキャスト完了までの時間。リキャストの予定がない場合はnull。
 */
export function untilRecast(skill: Skill, now: LocalDateTime): Duration | null {
  if (!recastLogic.isTimeBased(skill.recast)) {
    return null;
  }
  if (isFullCharged(skill)) {
    return null;
  }
  return recastLogic.untilReady(skill.recast, skill.recastingFrom, now);
}

/**
 * チャージしている使用可能回数を更新します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 更新したスキル
 */
export function refreshCastingCharge(
  skill: Skill,
  now: LocalDateTime,
): { skill: Skill; hasChange: boolean } {
  // 時間経過によるリキャストでなければチャージの更新はありません。
  if (!recastLogic.isTimeBased(skill.recast)) {
    return { skill, hasChange: false };
  }
  // チャージ回数を可能な限り更新します。
  // NOTE 処理速度向上のため、関数で定義しているロジックを利用せずに実装しています。
  let recastingFrom = skill.recastingFrom;
  let castingCharge: number = skill.castingCharge;
  let hasChange = false;
  do {
    // すでに最大チャージならチャージの更新はありません。
    if (skill.castingChargeLimit <= castingCharge) {
      break;
    }
    // リキャスト完了日時を取得します。
    const recastAt = recastLogic.readyAt(skill.recast, recastingFrom);
    // リキャスト中ならチャージの更新はありません。
    if (now.isBefore(recastAt)) {
      break;
    }
    // チャージを追加します。
    recastingFrom = recastAt as RecastingFrom;
    castingCharge++;
    hasChange = true;
  } while (true);
  // 変更がなかった場合はそのままのインスタンスを返します。
  if (!hasChange) {
    return { skill, hasChange };
  }
  // 更新後のスキルを作成します。
  return {
    skill: zodParse(Skill, {
      ...skill,
      recastingFrom,
      castingCharge,
    }),
    hasChange,
  };
}

/**
 * スキルを使用します。
 * @param skill スキル
 * @param usedAt 使用日時
 * @returns 使用したあとのスキル
 */
export function use(skill: Skill, usedAt: SkillUsedAt): Skill {
  const keepRecasting = willRecastOverTime(skill); // リキャストの予定がある(途中のリキャストがある)場合はリキャストを継続します。
  return zodParse(Skill, {
    ...skill,
    recastingFrom: keepRecasting ? skill.recastingFrom : usedAt,
    lastUsedAt: usedAt,
    castingCharge: Math.max(0, skill.castingCharge - 1),
  });
}

/**
 * 可能ならチャージしている使用可能回数を+1します。
 * @param skill スキル
 * @returns 変更したスキル
 */
export function safeIncrementCastingCharge(skill: Skill): Skill {
  return zodParse(Skill, {
    ...skill,
    castingCharge: Math.min(skill.castingChargeLimit, skill.castingCharge + 1),
  });
}

/**
 * 可能ならチャージしている使用可能回数を-1します。
 * @param skill スキル
 * @returns 変更したスキル
 */
export function safeDecrementCastingCharge(skill: Skill): Skill {
  return zodParse(Skill, {
    ...skill,
    castingCharge: Math.max(0, skill.castingCharge - 1),
  });
}
