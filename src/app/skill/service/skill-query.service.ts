import { inject, Injectable } from '@angular/core';
import { Skill } from '../domain/skill';
import { InMemorySkillRepository } from './in-memory-skill-repository.service';

@Injectable({
  providedIn: 'root',
})
export class SkillQuery {
  readonly inMemorySkillRepository = inject(InMemorySkillRepository);

  async getSkills(): Promise<Skill[]> {
    return [...this.inMemorySkillRepository.skills];
  }
  async getSkill(skillId: string): Promise<Skill | undefined> {
    return this.inMemorySkillRepository.skills.find((it) => it.id === skillId);
  }
}
