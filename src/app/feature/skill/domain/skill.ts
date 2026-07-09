import z from 'zod';

import { LocalDateTimeCoerce } from '../../../util/zod-joda';
import { CompletedAt, Recast, RecastFrom } from './recast';

/** スキルID */
export const SkillIdBrand = Symbol();
export const SkillId = z.uuid().brand<typeof SkillIdBrand>();
export type SkillId = z.output<typeof SkillId>;

/** スキル名 */
export const SkillNameBrand = Symbol();
export const SkillName = z.string().trim().nonempty().max(100).brand<typeof SkillNameBrand>();
export type SkillName = z.output<typeof SkillName>;

/** スキル作成日時 */
export const CreatedAtBrand = Symbol();
export const CreatedAt = LocalDateTimeCoerce.brand<typeof CreatedAtBrand>();
export type CreatedAt = z.output<typeof CreatedAt>;

/** スキル編集日時 */
export const EditedAtBrand = Symbol();
export const EditedAt = LocalDateTimeCoerce.brand<typeof EditedAtBrand>();
export type EditedAt = z.output<typeof EditedAt>;

/** スキル使用日時 */
export const UsedAtBrand = Symbol();
export const UsedAt = LocalDateTimeCoerce.brand<typeof UsedAtBrand>();
export type UsedAt = z.output<typeof UsedAt>;

/** スキル削除日時 */
export const DeletedAtBrand = Symbol();
export const DeletedAt = LocalDateTimeCoerce.brand<typeof DeletedAtBrand>();
export type DeletedAt = z.output<typeof DeletedAt>;

/** チャージ数 */
export const ChargeCountBrand = Symbol();
export const ChargeCount = z.int().min(0).max(1000).brand<typeof ChargeCountBrand>();
export type ChargeCount = z.output<typeof ChargeCount>;

/** 最大チャージ数 */
export const ChargeLimitBrand = Symbol();
export const ChargeLimit = z.int().min(1).max(1000).brand<typeof ChargeLimitBrand>();
export type ChargeLimit = z.output<typeof ChargeLimit>;

/** チャージ追加日時 */
export const ChargeAddedAtBrand = Symbol();
export const ChargeAddedAt = LocalDateTimeCoerce.brand<typeof ChargeAddedAtBrand>();
export type ChargeAddedAt = z.output<typeof ChargeAddedAt>;

/** 初期チャージを持っている */
export const HasInitiallyChargeBrand = Symbol();
export const HasInitiallyCharge = z.boolean().brand<typeof HasInitiallyChargeBrand>();
export type HasInitiallyCharge = z.output<typeof HasInitiallyCharge>;

/**
 * チャージのスケジュール
 */
export const ChargeScheduleBrand = Symbol();
export const ChargeSchedule = z
  .strictObject({
    recastFrom: RecastFrom,
    completedAt: CompletedAt,
  })
  .brand<typeof ChargeScheduleBrand>()
  .readonly();
export type ChargeSchedule = z.output<typeof ChargeSchedule>;

/** スキル */
export const SkillBrand = Symbol();
export const Skill = z
  .strictObject({
    /** スキルID */
    id: SkillId,
    /** スキル名 */
    name: SkillName,
    /** スキル作成日時 */
    createdAt: CreatedAt,
    /** スキル最終使用日時 */
    lastUsedAt: UsedAt.nullable(),
    /** リキャスト */
    recast: Recast,
    /** 最大チャージ数 */
    chargeLimit: ChargeLimit,
    /** チャージのスケジュール */
    chargeSchedules: ChargeSchedule.array(),
    /** その他のチャージ数 */
    otherCharges: ChargeCount,
  })
  .brand<typeof SkillBrand>()
  .readonly();
export type Skill = z.output<typeof Skill>;
