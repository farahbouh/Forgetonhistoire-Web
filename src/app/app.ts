import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('forge-ton-histoire-web');
  protected readonly messageJava = signal(''); // nouvelle variable pour stocker la réponse
  private http = inject(HttpClient);

  constructor() {
    this.http.get('http://localhost:8080/test', { responseType: 'text' })
      .subscribe({
        next: (data) => this.messageJava.set(data), // on stocke la réponse ici
        error: (err) => console.error('Erreur:', err)
      });
  }
}

class Affichage{
  test:number;
  constructor ()
  {
    this.test=10000;
  }
  a()
  {
    console.log(this.test);
  }
}