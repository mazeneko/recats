import { isValid, ValueObject } from '../../util/type-util';
import { Recast } from './recast';

export class Skill {
  constructor(
    readonly id: string,
    readonly name: Skill.Name,
    readonly recast: Recast,
  ) {}
}

export namespace Skill {
  export class Name extends ValueObject<string> {
    readonly #brand: undefined; // important in Branded Type.
    static readonly MIN_LENGTH = 1;
    static readonly MAX_LENGTH = 30;
    static isValid(value: string): boolean {
      return isValid(value, (value) => new Name(value));
    }
    constructor(readonly value: string) {
      super();
      if (value.length < Name.MIN_LENGTH || Name.MAX_LENGTH < value.length) {
        throw new RangeError(
          `Name length must between ${Name.MIN_LENGTH} ~ ${Name.MAX_LENGTH}. [${value}]`,
        );
      }
    }
    toString(): string {
      return this.value;
    }
    equals(other: Name): boolean {
      return this.value === other.value;
    }
  }
}
