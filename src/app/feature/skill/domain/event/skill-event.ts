import z from 'zod';

import { LocalDateTimeCoerce } from '../../../../util/zod-joda';
import { Recast } from '../recast';
import {
  CastingChargeLimit,
  InitiallyAvailable,
  SkillCreatedAt,
  SkillId,
  SkillName,
  SkillUsedAt,
} from '../skill';

/** スキルを作成するイベント */
export const CreateSkillEventBrand = Symbol();
export const CreateSkillEvent = z
  .strictObject({
    /** スキル名 */
    name: SkillName,
    /** 最大チャージ数 */
    castingChargeLimit: CastingChargeLimit,
    /** リキャスト */
    recast: Recast,
    /** 初期状態でスキルが使用可能 */
    initiallyAvailable: InitiallyAvailable,
    /** 作成日時 */
    createdAt: SkillCreatedAt,
  })
  .brand<typeof CreateSkillEventBrand>()
  .readonly();
export type CreateSkillEvent = z.output<typeof CreateSkillEvent>;

/** スキルを使用するイベント */
export const UseSkillEventBrand = Symbol();
export const UseSkillEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
    /** 使用日時 */
    usedAt: SkillUsedAt,
  })
  .brand<typeof UseSkillEventBrand>()
  .readonly();
export type UseSkillEvent = z.output<typeof UseSkillEvent>;

/** スキルを削除するイベント */
export const DeleteSkillEventBrand = Symbol();
export const DeleteSkillEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
  })
  .brand<typeof DeleteSkillEventBrand>()
  .readonly();
export type DeleteSkillEvent = z.output<typeof DeleteSkillEvent>;

/** スキルのチャージを更新するイベント */
export const RefreshChargeEventBrand = Symbol();
export const RefreshChargeEvent = z
  .strictObject({
    /** 現在日時 */
    now: LocalDateTimeCoerce,
  })
  .brand<typeof RefreshChargeEventBrand>()
  .readonly();
export type RefreshChargeEvent = z.output<typeof RefreshChargeEvent>;

/** スキルのチャージを追加するイベント */
export const AddChargeEventBrand = Symbol();
export const AddChargeEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
  })
  .brand<typeof AddChargeEventBrand>()
  .readonly();
export type AddChargeEvent = z.output<typeof AddChargeEvent>;
