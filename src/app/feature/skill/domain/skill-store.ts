import { InjectionToken, Signal } from '@angular/core';

import {
  CreateSkillEvent,
  DeleteSkillEvent,
  RefreshCastingChargeEvent,
  UseSkillEvent,
} from './event/skill-event';
import { Skill, SkillId } from './skill';

/**
 * SkillReaderのDIトークン
 */
export const SKILL_READER = new InjectionToken<SkillReader>('skill.reader');

/**
 * スキルの読み取り操作を提供します。
 */
export interface SkillReader {
  /**
   * すべてのスキルのsignalを取得します。
   * @return すべてのスキルのsignal
   */
  skills(): Signal<Skill[]>;
  /**
   * すべてのスキルを取得します。
   * @return すべてのスキル
   */
  getAll(): Promise<Skill[]>;
  /**
   * 指定したIDのスキルを取得します。
   * @param skillId スキルID
   * @returns スキル。存在しない場合はnull
   */
  getById(skillId: SkillId): Promise<Skill | null>;
}

/**
 * SkillMutatorのDIトークン
 */
export const SKILL_MUTATOR = new InjectionToken<SkillMutator>('skill.mutator');

/**
 * スキルの変更操作を提供します。
 */
export interface SkillMutator {
  /**
   * スキル作成イベントをハンドルします。
   * @param event スキル作成イベント
   * @returns 作成したスキルのID
   */
  handleCreateSkillEvent(event: CreateSkillEvent): Promise<SkillId>;
  /**
   * スキル使用イベントをハンドルします。
   * @param event スキル使用イベント
   */
  handleUseSkillEvent(event: UseSkillEvent): Promise<void>;
  /**
   * スキル削除イベントをハンドルします。
   * @param event スキル削除イベント
   */
  handleDeleteSkillEvent(event: DeleteSkillEvent): Promise<void>;
  /**
   * スキルのチャージを更新するイベントをハンドルします。
   * @param event スキルのチャージを更新するイベント
   */
  handleRefreshCastingChargeEvent(event: RefreshCastingChargeEvent): Promise<void>;
}
