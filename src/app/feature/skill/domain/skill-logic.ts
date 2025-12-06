import { Duration, LocalDateTime } from '@js-joda/core';

import { recastLogic } from '.';
import { zodParse } from '../../../util/zod';
import { CreateSkillEvent } from './event/skill-event';
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
  if (isFullCharged(skill)) {
    return null;
  }
  if (!recastLogic.isTimeBased(skill.recast)) {
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
  const _recastAt = recastAt(skill);
  if (_recastAt === null) {
    return null;
  }
  return Duration.between(now, _recastAt);
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
  // すでに最大チャージならチャージの更新はありません。
  if (isFullCharged(skill)) {
    return { skill, hasChange: false };
  }
  // リキャスト完了日時を取得します。
  const _recastAt = recastAt(skill);
  // リキャスト完了日時がなければチャージの更新はありません。
  if (_recastAt === null) {
    return { skill, hasChange: false };
  }
  // リキャスト中ならチャージの更新はありません。
  const stillRecasting = now.isBefore(_recastAt);
  if (stillRecasting) {
    return { skill, hasChange: false };
  }
  // チャージを追加します。
  return {
    skill: zodParse(Skill, {
      ...skill,
      recastingFrom: _recastAt, // 次のリキャストのために基準日時を更新します。
      castingCharge: skill.castingCharge + 1,
    }),
    hasChange: true,
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
