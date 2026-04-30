import {
  effect,
  EnvironmentProviders,
  inject,
  provideAppInitializer,
  untracked,
} from '@angular/core';

import { RefreshChargeEvent } from '../../feature/skill/domain/event/skill-event';
import { SKILL_MUTATOR } from '../../feature/skill/domain/skill-store';
import { CURRENT_DATE_TIME } from '../../util/current-date-time-provider';
import { zodParse } from '../../util/zod';

/**
 * 現在日時が変わった時にチャージをリフレッシュする自動化を提供します。
 */
export function provideRefreshCastingChargeAutomation(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const currentDateTime = inject(CURRENT_DATE_TIME);
    const skillMutator = inject(SKILL_MUTATOR);
    effect(() => {
      const now = currentDateTime();
      untracked(() => {
        const refreshEvent = zodParse(RefreshChargeEvent, { now });
        skillMutator.handleRefreshChargeEvent(refreshEvent);
      });
    });
  });
}
