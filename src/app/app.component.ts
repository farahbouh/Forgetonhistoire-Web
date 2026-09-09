import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Assistant de Coherence Narrative</h1>
    
    <div>
      <button (click)="creerHistoire()">Creer une histoire</button>
      <button (click)="reprendreHistoire()">Reprendre une histoire</button>
      <button (click)="chargerPersonnages()">Voir les personnages</button>
      <button (click)="chargerLivres()">Voir les livres</button>
      <button (click)="testerConnexion()">Tester connexion</button>
    </div>

    <div *ngIf="message()">
      {{ message() }}
    </div>

    <div *ngIf="showForm()">
      <h2>Ajouter une histoire</h2>
      
      <div>
        <label>Titre *</label>
        <input 
          [(ngModel)]="nouvelleHistoire.nom"
          placeholder="Titre de l'histoire">
      </div>
      
      <div>
        <label>Type</label>
        <input 
          [(ngModel)]="nouvelleHistoire.type"
          placeholder="Ex: Roman, Fantastique">
      </div>
      
      <div>
        <label>Description</label>
        <textarea 
          [(ngModel)]="nouvelleHistoire.description"
          placeholder="Description"
          rows="3"></textarea>
      </div>
      
      <button (click)="ajouterHistoire()">Ajouter</button>
      <button (click)="annulerAjout()">Annuler</button>
    </div>

    <div *ngIf="personnages().length > 0">
      <h2>Personnages</h2>
      <div *ngFor="let p of personnages()">
        <strong>{{ p.prenom }} {{ p.nom }}</strong>
        <span>{{ p.description }}</span>
      </div>
    </div>

    <div *ngIf="livres().length > 0">
      <h2>Livres</h2>
      <div *ngFor="let livre of livres()">
        <strong>{{ livre.nom }}</strong>
        <span>{{ livre.type }}</span>
        <br>
        <span>{{ livre.description }}</span>
      </div>
    </div>
  `
})
export class App {
  message = signal('');
  personnages = signal<any[]>([]);
  livres = signal<any[]>([]);
  showForm = signal(false);
  
  nouvelleHistoire = {
    nom: '',
    type: 'Histoire',
    description: ''
  };

  private http = inject(HttpClient);

  constructor() {
    this.chargerLivres();
  }

  creerHistoire() {
    this.showForm.set(true);
    this.message.set('Formulaire ajout histoire');
    this.nouvelleHistoire = { nom: '', type: 'Histoire', description: '' };
  }

  annulerAjout() {
    this.showForm.set(false);
    this.message.set('Ajout annule');
  }

  reprendreHistoire() {
    this.message.set('Chargement des histoires...');
    this.chargerLivres();
  }

  ajouterHistoire() {
    if (!this.nouvelleHistoire.nom.trim()) {
      this.message.set('Titre obligatoire');
      return;
    }

    this.http.post('http://localhost:8080/api/livres', this.nouvelleHistoire)
      .subscribe({
        next: (response: any) => {
          this.message.set(`Histoire ajoutee (ID: ${response.id})`);
          this.showForm.set(false);
          this.chargerLivres();
          this.nouvelleHistoire = { nom: '', type: 'Histoire', description: '' };
        },
        error: (err) => {
          this.message.set('Erreur: ' + err.message);
          console.error('Erreur:', err);
        }
      });
  }

  chargerPersonnages() {
    this.message.set('Chargement personnages...');
    this.http.get('http://localhost:8080/api/personnages')
      .subscribe({
        next: (data: any) => {
          this.personnages.set(data);
          this.message.set(`${data.length} personnage(s)`);
        },
        error: (err) => {
          this.message.set('Erreur: ' + err.message);
        }
      });
  }

  chargerLivres() {
    this.message.set('Chargement livres...');
    this.http.get('http://localhost:8080/api/livres')
      .subscribe({
        next: (data: any) => {
          this.livres.set(data);
          this.message.set(`${data.length} livre(s)`);
        },
        error: (err) => {
          this.message.set('Erreur: ' + err.message);
        }
      });
  }

  testerConnexion() {
    this.message.set('Test connexion...');
    this.http.get('http://localhost:8080/test', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.message.set('Connexion OK');
          console.log('Reponse Java:', data);
        },
        error: (err) => {
          this.message.set('Erreur connexion');
        }
      });
  }
}