# client (Angular)

This is a scaffolded Angular application created with module-based architecture (no standalone components).

Key options used:
- Routing: enabled
- Styling: SCSS
- Strict mode: enabled
- Standalone components: disabled (classic NgModule-based app)

Quick start

1. Install dependencies

```bash
cd client
npm install
```

2. Run the dev server

```bash
npx ng serve --host 127.0.0.1 --port 4200
# or
npm start
```

3. Open http://localhost:4200 in your browser.

Notes

- The top-level AppModule is defined at `src/app/app-module.ts` and routing is in `src/app/app-routing-module.ts`.
- This project purposely uses NgModules instead of standalone components to match traditional Angular architecture.
# Client

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## PrimeNG (UI Components)

PrimeNG has been installed (primeng, primeicons, primeflex) and its theme and styles were added to the global styles in `angular.json`.

To use PrimeNG components in a feature module, import the module(s) you need. Example (DataTable):

```ts
// in your feature module
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@NgModule({
	imports: [CommonModule, TableModule],
})
export class FeatureModule {}
```

And in a component template you can use the table:

```html
<p-table [value]="items">
	<ng-template pTemplate="header">
		<tr><th>Name</th><th>Value</th></tr>
	</ng-template>
	<ng-template pTemplate="body" let-item>
		<tr><td>{{item.name}}</td><td>{{item.value}}</td></tr>
	</ng-template>
</p-table>
```

Browser animations were enabled in `AppModule` to support PrimeNG animations.

