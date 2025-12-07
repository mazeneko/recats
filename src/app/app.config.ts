import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideRefreshCastingChargeAutomation } from './controller/automation/skill-refresher';
import { provideInMemorySkillStore } from './feature/skill/repository/in-memory-skill-store';
import { configZodMessage } from './l10n/zod-message';
import { provideCurrentDateTime } from './util/current-date-time-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAppInitializer(() => configZodMessage()), // zodのメッセージを設定します。
    provideCurrentDateTime(100),
    provideInMemorySkillStore(),
    provideRefreshCastingChargeAutomation(),
  ],
};
