import {
  effect,
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  Signal,
} from '@angular/core';

import { zodUnknownParse } from '../../../util/zod';
import {
  AddChargeEvent,
  CreateSkillEvent,
  DeleteSkillEvent,
  UseSkillEvent,
} from '../domain/event/skill-event';
import { Skill, SkillId } from '../domain/skill';
import { SKILL_MUTATOR, SKILL_READER, SkillMutator, SkillReader } from '../domain/skill-store';
import { InMemorySkillStore } from './in-memory-skill-store';

/**
 * ローカルストレージでのスキルストア実装です。
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageSkillStore implements SkillReader, SkillMutator {
  readonly #inMemorySkillStore = inject(InMemorySkillStore);

  constructor() {
    this.#loadSkills();
    effect(() => this.#saveSkills(this.#inMemorySkillStore.skills()()));
  }

  #saveSkills(skills: Skill[]): void {
    localStorage.setItem('skills', JSON.stringify(skills));
  }

  #loadSkills(): void {
    const skillsJson = localStorage.getItem('skills');
    const skills =
      skillsJson == null ? [] : zodUnknownParse(Skill.array(), JSON.parse(skillsJson) as unknown);
    this.#inMemorySkillStore.loadSkills(skills);
  }

  skills(): Signal<Skill[]> {
    return this.#inMemorySkillStore.skills();
  }

  async getAll(): Promise<Skill[]> {
    return this.#inMemorySkillStore.getAll();
  }

  async getById(skillId: SkillId): Promise<Skill | null> {
    return this.#inMemorySkillStore.getById(skillId);
  }

  async handleCreateSkillEvent(event: CreateSkillEvent): Promise<SkillId> {
    return this.#inMemorySkillStore.handleCreateSkillEvent(event);
  }

  async handleUseSkillEvent(event: UseSkillEvent): Promise<void> {
    return this.#inMemorySkillStore.handleUseSkillEvent(event);
  }

  async handleDeleteSkillEvent(event: DeleteSkillEvent): Promise<void> {
    return this.#inMemorySkillStore.handleDeleteSkillEvent(event);
  }

  async handleAddChargeEvent(event: AddChargeEvent): Promise<void> {
    return this.#inMemorySkillStore.handleAddChargeEvent(event);
  }
}

/**
 * ローカルストレージでのスキルストア実装を提供します。
 */
export function provideLocalStorageSkillStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SKILL_READER, useExisting: LocalStorageSkillStore },
    { provide: SKILL_MUTATOR, useExisting: LocalStorageSkillStore },
  ]);
}
