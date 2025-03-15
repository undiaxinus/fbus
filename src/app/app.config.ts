import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SupabaseService } from './services/supabase.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withHashLocation(),
      withViewTransitions()
    ),
    provideClientHydration(),
    importProvidersFrom(BrowserAnimationsModule),
    SupabaseService
  ]
};
