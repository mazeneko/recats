import { Injectable } from '@angular/core';
import { LocalTime } from '@js-joda/core';

import { Recast } from '../domain/recast';
import { Skill } from '../domain/skill';

@Injectable({
  providedIn: 'root',
})
export class InMemorySkillRepository {
  // TODO dummy data
  readonly skills: Skill[] = [
    {
      id: crypto.randomUUID(),
      name: new Skill.Name('h'),
      recast: new Recast.DailyRecast(1, LocalTime.now()),
    },
    {
      id: crypto.randomUUID(),
      name: new Skill.Name('ho'),
      recast: new Recast.DailyRecast(1, LocalTime.now()),
    },
    {
      id: crypto.randomUUID(),
      name: new Skill.Name('hog'),
      recast: new Recast.DailyRecast(1, LocalTime.now()),
    },
    {
      id: crypto.randomUUID(),
      name: new Skill.Name('hoge'),
      recast: new Recast.DailyRecast(1, LocalTime.now()),
    },
  ];

  addSkill(skill: Skill): Skill {
    if (this.skills.some((it) => it.id === skill.id)) {
      throw new Error(`duplicated ID ${skill.id}`);
    }
    this.skills.push(skill);
    return skill;
  }

  editSkill(skill: Skill): Skill {
    const index = this.skills.findIndex((it) => it.id === skill.id);
    if (index === -1) {
      throw new Error(`not found ID ${skill.id}`);
    }
    this.skills.splice(index, 1, skill);
    return skill;
  }

  deleteSkill(skillId: string): boolean {
    const index = this.skills.findIndex((it) => it.id === skillId);
    if (index === -1) {
      return false;
    }
    this.skills.splice(index, 1);
    return true;
  }
}
