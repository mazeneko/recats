import {
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  Signal,
  signal,
} from '@angular/core';

import { CustomError } from '../../../error/custom-error';
import { CURRENT_DATE_TIME } from '../../../util/current-date-time-provider';
import { skillLogic } from '../domain';
import {
  CreateSkillEvent,
  DeleteSkillEvent,
  RefreshCastingChargeEvent,
  UseSkillEvent,
} from '../domain/event/skill-event';
import { Skill, SkillId } from '../domain/skill';
import { SKILL_MUTATOR, SKILL_READER, SkillMutator, SkillReader } from '../domain/skill-store';

/**
 * インメモリでのスキルストア実装です。
 */
@Injectable({
  providedIn: 'root',
})
export class InMemorySkillStore implements SkillReader, SkillMutator {
  readonly #skills = signal<Skill[]>([]);
  readonly #currentDateTime = inject(CURRENT_DATE_TIME);

  skills(): Signal<Skill[]> {
    return this.#skills.asReadonly();
  }

  async getAll(): Promise<Skill[]> {
    return [...this.#skills()];
  }

  async getById(skillId: SkillId): Promise<Skill | null> {
    return this.#skills().find((it) => it.id === skillId) ?? null;
  }

  async handleCreateSkillEvent(event: CreateSkillEvent): Promise<SkillId> {
    const skill = skillLogic.createSkill(event, this.#currentDateTime());
    this.#saveOrUpdate(skill);
    return skill.id;
  }

  async handleUseSkillEvent(event: UseSkillEvent): Promise<void> {
    const skill = await this.getById(event.skillId);
    if (skill == null) {
      throw new CustomError(`ID[${event.skillId}]のスキルが見つかりません。`, {
        errorCode: 'SkillNotFoundError',
        skillId: event.skillId,
      });
    }
    if (!skillLogic.hasCharge(skill)) {
      throw new CustomError(`スキルのチャージがありません。`, {
        errorCode: 'OutOfChargeError',
        skillId: event.skillId,
      });
    }
    const updatedSkill = skillLogic.use(skill, this.#currentDateTime());
    this.#saveOrUpdate(updatedSkill);
  }

  async handleDeleteSkillEvent(event: DeleteSkillEvent): Promise<void> {
    await this.#delete(event.skillId);
  }

  async handleRefreshCastingChargeEvent(event: RefreshCastingChargeEvent): Promise<void> {
    const skills = await this.getAll();
    skills
      .map((skill) => skillLogic.refreshCastingCharge(skill, event.now))
      .filter((refreshed) => refreshed.hasChange)
      .forEach((refreshed) => this.#saveOrUpdate(refreshed.skill));
  }

  async #saveOrUpdate(skill: Skill): Promise<void> {
    this.#skills.update((skills) => {
      const filteredSkills = skills.filter((it) => it.id !== skill.id);
      return [...filteredSkills, skill].sort((a, b) => a.createdAt.compareTo(b.createdAt));
    });
  }

  async #delete(skillId: SkillId): Promise<void> {
    this.#skills.set(this.#skills().filter((it) => it.id !== skillId));
  }
}

/**
 * インメモリでのスキルストア実装を提供します。
 */
export function provideInMemorySkillStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SKILL_READER, useExisting: InMemorySkillStore },
    { provide: SKILL_MUTATOR, useExisting: InMemorySkillStore },
  ]);
}
