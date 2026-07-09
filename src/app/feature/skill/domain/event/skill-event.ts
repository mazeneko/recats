import z from 'zod';

import { Recast } from '../recast';
import {
  ChargeAddedAt,
  ChargeLimit,
  CreatedAt,
  DeletedAt,
  EditedAt,
  HasInitiallyCharge,
  SkillId,
  SkillName,
  UsedAt,
} from '../skill';

/** スキルを作成するイベント */
export const CreateSkillEventBrand = Symbol();
export const CreateSkillEvent = z
  .strictObject({
    /** スキル名 */
    name: SkillName,
    /** 最大チャージ数 */
    chargeLimit: ChargeLimit,
    /** リキャスト */
    recast: Recast,
    /** 初期チャージを持っている */
    hasInitiallyCharge: HasInitiallyCharge,
    /** 作成日時 */
    createdAt: CreatedAt,
  })
  .brand<typeof CreateSkillEventBrand>()
  .readonly();
export type CreateSkillEvent = z.output<typeof CreateSkillEvent>;

/** スキル名を編集するイベント */
export const EditSkillNameEventBrand = Symbol();
export const EditSkillNameEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
    /** スキル名 */
    name: SkillName,
    /** 編集日時 */
    editedAt: EditedAt,
  })
  .brand<typeof EditSkillNameEventBrand>()
  .readonly();
export type EditSkillNameEvent = z.output<typeof EditSkillNameEvent>;

/** リキャストを編集するイベント */
export const EditRecastEventBrand = Symbol();
export const EditRecastEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
    /** リキャスト */
    recast: Recast,
    /** 最大チャージ数 */
    chargeLimit: ChargeLimit,
    /** 編集日時 */
    editedAt: EditedAt,
  })
  .brand<typeof EditRecastEventBrand>()
  .readonly();
export type EditRecastEvent = z.output<typeof EditRecastEvent>;

/** スキルを使用するイベント */
export const UseSkillEventBrand = Symbol();
export const UseSkillEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
    /** 使用日時 */
    usedAt: UsedAt,
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
    /** 削除日時 */
    deletedAt: DeletedAt,
  })
  .brand<typeof DeleteSkillEventBrand>()
  .readonly();
export type DeleteSkillEvent = z.output<typeof DeleteSkillEvent>;

/** スキルのチャージを追加するイベント */
export const AddChargeEventBrand = Symbol();
export const AddChargeEvent = z
  .strictObject({
    /** スキルID */
    skillId: SkillId,
    /** 追加日時 */
    addedAt: ChargeAddedAt,
  })
  .brand<typeof AddChargeEventBrand>()
  .readonly();
export type AddChargeEvent = z.output<typeof AddChargeEvent>;
