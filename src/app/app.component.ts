import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:800px;margin:50px auto;padding:20px;font-family:Arial;">
      <h1 style="color:#2c3e50;">Assistant de Cohérence Narrative</h1>
      
      <!-- Boutons -->
      <div style="display:flex;flex-direction:column;gap:15px;margin:30px 0;">
        <button (click)="creerHistoire()" style="padding:15px;background:#2ecc71;color:white;border:none;border-radius:8px;font-size:18px;cursor:pointer;">
           Créer une histoire
        </button>
        <div style="display:flex;flex-direction:column;gap:15px;margin:30px 0;">
        <button (click)="reprendreHistoire()" style="padding:15px;background:#2ecc71;color:white;border:none;border-radius:8px;font-size:18px;cursor:pointer;">
           Reprendre une histoire
        </button>
        
        <button (click)="chargerPersonnages()" style="padding:15px;background:#3498db;color:white;border:none;border-radius:8px;font-size:18px;cursor:pointer;">
           Voir les personnages
        </button>

      </div>

      <!-- Message -->
      <div *ngIf="message()" style="padding:15px;background:#ecf0f1;border-radius:8px;margin:10px 0;">
        {{ message() }}
      </div>

      <!-- Liste des personnages -->
      <div *ngIf="personnages().length > 0" style="margin-top:20px;">
        <h2 style="color:#2c3e50;"> Personnages</h2>
        <div *ngFor="let p of personnages()" >
          <strong>{{ p.prenom }} {{ p.nom }}</strong>
          <span style="color:#7f8c8d;margin-left:10px;">{{ p.description }}</span>
        </div>
      </div>
    </div>
  `
})
export class App {
  message = signal('');
  personnages = signal<any[]>([]);
  
  private http = inject(HttpClient);

  constructor() {}

  creerHistoire() {
    this.message.set('Créer une nouvelle histoire');
  }
  reprendreHistoire(){
    this.message.set('Créer une nouvelle histoire');
  }

  chargerPersonnages() {
    this.http.get('http://localhost:8080/api/personnages')
      .subscribe({
        next: (data: any) => {
          this.personnages.set(data);
          console.log('Personnages:', data);
        },
        error: (err) => {console.error('Erreur:', err);
        }
      });
  }

  testerConnexion() {
    this.http.get('http://localhost:8080/test', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          console.log('Réponse Java:', data); // recup java
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
  }
}