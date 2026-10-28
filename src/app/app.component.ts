import { Component } from '@angular/core';
import { LivreComponent } from './components/livre/livre.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LivreComponent],
  template: `
    <main class="page">
      <h1>Forge ton histoire</h1>
      <app-livre />
    </main>
  `,
  styleUrl: './app.css'
})
export class App {}
