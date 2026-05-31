import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root shell — routed pages render through the outlet (login, dashboard, admin). */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly title = 'SR&ED Dashboard';
}
