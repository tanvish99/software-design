import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImportsModule } from './imports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ImportsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');
}
