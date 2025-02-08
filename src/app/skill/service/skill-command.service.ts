import { inject, Injectable } from '@angular/core';

import { Recast } from '../domain/recast';
import { Skill } from '../domain/skill';
import { InMemorySkillRepository } from './in-memory-skill-repository.service';

export class CreateSkillEvent {
  constructor(
    readonly name: Skill.Name,
    readonly recast: Recast,
  ) {}
  create(): Skill {
    return new Skill(crypto.randomUUID(), this.name, this.recast);
  }
}

export class EditSkillEvent {
  constructor(
    readonly id: string,
    readonly name: Skill.Name,
    readonly recast: Recast,
  ) {}
  resolve(): Skill {
    return new Skill(this.id, this.name, this.recast);
  }
}

export class DeleteSkillEvent {
  constructor(readonly skillId: string) {}
}

@Injectable({
  providedIn: 'root',
})
export class SkillCommand {
  readonly inMemorySkillRepository = inject(InMemorySkillRepository);

  async createSkill(event: CreateSkillEvent): Promise<Skill> {
    const skill = event.create();
    return this.inMemorySkillRepository.addSkill(skill);
  }
  async editSkill(event: EditSkillEvent): Promise<Skill> {
    const skill = event.resolve();
    return this.inMemorySkillRepository.editSkill(skill);
  }
  async deleteSkill(event: DeleteSkillEvent): Promise<boolean> {
    return this.inMemorySkillRepository.deleteSkill(event.skillId);
  }
}
