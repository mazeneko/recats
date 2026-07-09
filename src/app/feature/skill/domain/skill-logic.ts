import { Duration, LocalDateTime } from '@js-joda/core';

import { zodParse } from '../../../util/zod';
import { CreateSkillEvent } from './event/skill-event';
import { Recast, RecastFrom } from './recast';
import { completedAt, isTimeBased } from './recast-logic';
import { ChargeCount, ChargeSchedule, Skill, UsedAt } from './skill';

/**
 * スキルを作成します。
 * @param event スキルを作成するイベント
 * @returns 作成したスキル
 */
export function createSkill(event: CreateSkillEvent): Skill {
  const recastFrom = zodParse(RecastFrom, event.createdAt);
  const otherCharges = zodParse(ChargeCount, event.hasInitiallyCharge ? 1 : 0);
  const chargeSchedules = scheduleCharges(
    event.recast,
    recastFrom,
    event.chargeLimit - otherCharges,
  );
  return zodParse(Skill, {
    id: crypto.randomUUID(),
    name: event.name,
    createdAt: event.createdAt,
    lastUsedAt: null,
    recast: event.recast,
    chargeLimit: event.chargeLimit,
    chargeSchedules,
    otherCharges,
  });
}

/**
 * チャージ完了日時を指定された回数分スケジュールします。
 * @param recast リキャスト
 * @param recastFrom リキャスト基準日時
 * @param scheduleCount 何回分先までスケジュールするか
 * @returns チャージのスケジュールのリスト
 */
export function scheduleCharges(
  recast: Recast,
  recastFrom: RecastFrom,
  scheduleCount: number,
): ChargeSchedule[] {
  if (!isTimeBased(recast)) {
    return [];
  }
  const schedules: ChargeSchedule[] = [];
  let _recastFrom = recastFrom;
  for (let i = 0; i < scheduleCount; i++) {
    const schedule = zodParse(ChargeSchedule, {
      recastFrom: _recastFrom,
      completedAt: completedAt(recast, _recastFrom),
    });
    schedules.push(schedule);
    _recastFrom = zodParse(RecastFrom, schedule.completedAt);
  }
  return schedules;
}

/**
 * 将来にスケジュールされているチャージをピックします。
 * @param skill スキル
 * @param now 現在日時
 * @returns 将来にスケジュールされているチャージ
 */
export function pickScheduledCharges(skill: Skill, now: LocalDateTime): ChargeSchedule[] {
  return skill.chargeSchedules.filter((timing) => timing.completedAt.isAfter(now));
}

/**
 * 完了しているチャージをピックします。
 * @param skill スキル
 * @param now 現在日時
 * @returns 完了しているチャージ
 */
export function pickCompletedCharges(skill: Skill, now: LocalDateTime): ChargeSchedule[] {
  return skill.chargeSchedules.filter((timing) => !timing.completedAt.isAfter(now));
}

/**
 * 次回のチャージを取得します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 次回のチャージ。チャージの予定がない場合はnull。
 */
export function pickNextScheduledCharge(skill: Skill, now: LocalDateTime): ChargeSchedule | null {
  const scheduled = pickScheduledCharges(skill, now);
  if (scheduled.length == 0) {
    return null;
  }
  return scheduled.reduce((min, current) =>
    current.completedAt.isBefore(min.completedAt) ? current : min,
  );
}

/**
 * 最後に完了したチャージを取得します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 最後に完了したチャージ。完了したチャージがない場合はnull。
 */
export function pickLatestCompletedCharge(skill: Skill, now: LocalDateTime): ChargeSchedule | null {
  const completed = pickCompletedCharges(skill, now);
  if (completed.length == 0) {
    return null;
  }
  return completed.reduce((max, current) =>
    current.completedAt.isAfter(max.completedAt) ? current : max,
  );
}

/**
 * チャージ数を返します。
 * @param skill スキル
 * @param now 現在日時
 * @returns チャージ数
 */
export function countCharges(skill: Skill, now: LocalDateTime): ChargeCount {
  const completed = pickCompletedCharges(skill, now).length;
  const charges = completed + skill.otherCharges;
  return zodParse(ChargeCount, charges);
}

/**
 * チャージがあればtrueを返します。
 * @param skill スキル
 * @param now 現在日時
 * @returns チャージがあればtrue
 */
export function hasCharge(skill: Skill, now: LocalDateTime): boolean {
  return 0 < countCharges(skill, now);
}

/**
 * 最大チャージならtrueを返します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 最大チャージならtrue
 */
export function hasFullCharges(skill: Skill, now: LocalDateTime): boolean {
  return skill.chargeLimit <= countCharges(skill, now);
}

/**
 * 次回のチャージまでの時間を取得します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 次回のチャージまでの時間。チャージの予定がない場合はnull。
 */
export function untilNextCharge(skill: Skill, now: LocalDateTime): Duration | null {
  const nextCharge = pickNextScheduledCharge(skill, now);
  if (nextCharge == null) {
    return null;
  }
  return Duration.between(now, nextCharge.completedAt);
}

/**
 * 次回のチャージの進行度を取得します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 次回のチャージの進行度。パーセントの数値です。
 */
export function getNextChargeProgress(skill: Skill, now: LocalDateTime): number | null {
  const nextCharge = pickNextScheduledCharge(skill, now);
  if (nextCharge == null) {
    return null;
  }
  const total = Duration.between(nextCharge.recastFrom, nextCharge.completedAt);
  const current = Duration.between(nextCharge.recastFrom, now);
  return (current.toMillis() / total.toMillis()) * 100;
}

/**
 * 一番古いチャージを取り除きます。
 * @param charges チャージのリスト
 * @returns 一番古いチャージを取り除いたリスト
 */
function removeOldestCharge(charges: ChargeSchedule[]): ChargeSchedule[] {
  if (charges.length === 0) {
    return [];
  }
  let oldestIndex = 0;
  for (let index = 0; index < charges.length; index++) {
    if (charges[index].completedAt.isBefore(charges[oldestIndex].completedAt)) {
      oldestIndex = index;
    }
  }
  return charges.filter((_, index) => index !== oldestIndex);
}

/**
 * 一番新しいチャージを取り除きます。
 * @param charges チャージのリスト
 * @returns 一番新しいチャージを取り除いたリスト
 */
function removeNewestCharge(charges: ChargeSchedule[]): ChargeSchedule[] {
  if (charges.length === 0) {
    return [];
  }
  let newestIndex = 0;
  for (let index = 0; index < charges.length; index++) {
    if (charges[index].completedAt.isAfter(charges[newestIndex].completedAt)) {
      newestIndex = index;
    }
  }
  return charges.filter((_, index) => index !== newestIndex);
}

/**
 * スキルを使用します。
 * @param skill スキル
 * @param usedAt 使用日時
 * @returns 使用したあとのスキル
 */
export function useSkill(skill: Skill, usedAt: UsedAt): Skill {
  // リキャスト基準日時を決定します。
  // 進行中のリキャストがあればそのまま継続させたいので、スケジュールしなおさずそのままチャージタイミングに差し込みます。
  // 差し込んだ場合は次回のリキャストから先だけをスケジュールしなおしたいので、nextを基準日時とします。
  const nextCharge = pickNextScheduledCharge(skill, usedAt);
  const recastFrom = zodParse(RecastFrom, nextCharge === null ? usedAt : nextCharge.completedAt);
  // その他のチャージがあれば消費します。
  const useOtherCharge = skill.otherCharges > 0;
  const otherCharges = useOtherCharge ? skill.otherCharges - 1 : skill.otherCharges;
  // 保持したままにするチャージを決定します。
  const completedCharges = pickCompletedCharges(skill, usedAt);
  const remainingCharges = useOtherCharge
    ? completedCharges // その他のチャージを消費するのでそのままです。
    : removeOldestCharge(completedCharges); //一番古いチャージを消費します。
  const takeOverCharges = [...remainingCharges, ...(nextCharge === null ? [] : [nextCharge])];
  // チャージタイミングを再スケジュールします。
  const rescheduleCount = skill.chargeLimit - (takeOverCharges.length + otherCharges);
  const rescheduledCharges = scheduleCharges(skill.recast, recastFrom, rescheduleCount);
  const chargeSchedules = [...takeOverCharges, ...rescheduledCharges];
  return zodParse(Skill, {
    // そのまま
    id: skill.id,
    name: skill.name,
    createdAt: skill.createdAt,
    recast: skill.recast,
    chargeLimit: skill.chargeLimit,
    // 変更あり
    lastUsedAt: usedAt,
    chargeSchedules,
    otherCharges,
  });
}

/**
 * 可能ならチャージ数を+1します。
 * @param skill スキル
 * @param now 現在日時
 * @returns 変更したスキル
 */
export function incrementCharge(skill: Skill): Skill {
  // その他のチャージを増やし、スケジュールしているチャージを１つ減らします。
  const otherCharges = skill.otherCharges + 1;
  const chargeSchedules = removeNewestCharge(skill.chargeSchedules);
  return zodParse(Skill, {
    // そのまま
    id: skill.id,
    name: skill.name,
    createdAt: skill.createdAt,
    lastUsedAt: skill.lastUsedAt,
    recast: skill.recast,
    chargeLimit: skill.chargeLimit,
    // 変更あり
    chargeSchedules,
    otherCharges,
  });
}
