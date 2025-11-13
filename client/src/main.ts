import { bootstrapApplication } from '@angular/platform-browser';
import { isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

  export const appConfig: ApplicationConfig = {
      providers: [
      provideHttpClient(withFetch()),
      provideAnimationsAsync(),
      provideRouter(routes),
      providePrimeNG({
          theme: { preset: Aura, options: { darkModeSelector: '.p-dark' } },
      }),
    ],
  };

    bootstrapApplication(App, appConfig).catch((err) =>
    console.error(err)
);

    // Register service worker in production builds
    if ('serviceWorker' in navigator && !isDevMode()) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then((reg) => console.log('Service worker registered:', reg.scope))
        .catch((err) => console.error('Service worker registration failed:', err));
    }