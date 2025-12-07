import z from 'zod';

import { LocalDateTimeCoerce } from '../../../util/zod-joda';
import { Recast, RecastingFrom } from './recast';

/** スキルID */
export const SkillIdBrand = Symbol();
export const SkillId = z.uuid().brand<typeof SkillIdBrand>();
export type SkillId = z.output<typeof SkillId>;

/** スキル名 */
export const SkillNameBrand = Symbol();
export const SkillName = z.string().trim().nonempty().max(100).brand<typeof SkillNameBrand>();
export type SkillName = z.output<typeof SkillName>;

/** スキル作成日時 */
export const SkillCreatedAtBrand = Symbol();
export const SkillCreatedAt = LocalDateTimeCoerce.brand<typeof SkillCreatedAtBrand>();
export type SkillCreatedAt = z.output<typeof SkillCreatedAt>;

/** スキル使用日時 */
export const SkillUsedAtBrand = Symbol();
export const SkillUsedAt = LocalDateTimeCoerce.brand<typeof SkillUsedAtBrand>();
export type SkillUsedAt = z.output<typeof SkillUsedAt>;

/** チャージ数 */
export const CastingChargeBrand = Symbol();
export const CastingCharge = z.int().min(0).max(1000).brand<typeof CastingChargeBrand>();
export type CastingCharge = z.output<typeof CastingCharge>;

/** 最大チャージ数 */
export const CastingChargeLimitBrand = Symbol();
export const CastingChargeLimit = z.int().min(1).max(1000).brand<typeof CastingChargeLimitBrand>();
export type CastingChargeLimit = z.output<typeof CastingChargeLimit>;

/** 初期状態でスキルが使用可能 */
export const InitiallyAvailableBrand = Symbol();
export const InitiallyAvailable = z.boolean().brand<typeof InitiallyAvailableBrand>();
export type InitiallyAvailable = z.output<typeof InitiallyAvailable>;

/** スキル */
export const SkillBrand = Symbol();
export const Skill = z
  .strictObject({
    /** スキルID */
    id: SkillId,
    /** スキル名 */
    name: SkillName,
    /** スキル作成日時 */
    createdAt: SkillCreatedAt,
    /** スキル使用日時 */
    lastUsedAt: SkillUsedAt.nullable(),
    /** チャージ数 */
    castingCharge: CastingCharge,
    /** 最大チャージ数 */
    castingChargeLimit: CastingChargeLimit,
    /** リキャスト */
    recast: Recast,
    /** リキャスト基準日時 */
    recastingFrom: RecastingFrom,
  })
  .brand<typeof SkillBrand>()
  .readonly();
export type Skill = z.output<typeof Skill>;
