import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { DashboardDataService } from './services/dashboard-data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    {
      // Load the seed dataset before the app renders so components can assume data is ready.
      provide: APP_INITIALIZER,
      multi: true,
      deps: [DashboardDataService],
      useFactory: (data: DashboardDataService) => () => data.load(),
    },
  ],
};
