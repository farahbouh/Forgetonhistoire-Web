import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Forge ton histoire</h1>

    <div>
      <!-- entrée du site --> 
      <button (click)="creerlivre()">Creer un livre</button>
      <button (click)="reprendrelivre()">Reprendre un livre</button>
    </div>

    <div *ngIf="message()">
      {{ message() }}
    </div>

    <!-- livre afficher -->
    <div *ngIf="livreActive()">
      <h2> {{ livreActive().nom }}</h2>
      <p><em>{{ livreActive().type }}</em></p>
      <p>{{ livreActive().description }}</p>
      <button (click)="fermerlivre()">Fermer</button>
    </div>

    <!-- CHOIX D'UNE HISTOIRE A REPRENDRE -->
    <div *ngIf="showSelection()" style="border: 1px solid blue; padding: 10px; margin-top: 10px;">
      <h2>Choisir un livre</h2>
      <div *ngIf="livres().length === 0">Aucun livre disponible.</div>
      <div *ngFor="let livre of livres()" style="border-bottom: 1px solid #ccc; padding: 6px 0;">
        <strong>{{ livre.nom }}</strong> - <span>{{ livre.type }}</span>
        <button (click)="ouvrirlivre(livre)">Reprendre</button>
      </div>
      <button (click)="annulerSelection()">Annuler</button>
    </div>

    <!-- formulaire de création -->
    <div *ngIf="showForm()">
      <h2>Ajouter un livre</h2>
      <div>
        <label>Titre *</label>
        <input [(ngModel)]="nouvellelivre.nom" placeholder="Titre">
      </div>
      <div>
        <label>Type</label>
        <input [(ngModel)]="nouvellelivre.type" placeholder="Ex: Roman">
      </div>
      <div>
        <label>Description</label>
        <textarea [(ngModel)]="nouvellelivre.description" rows="3"></textarea>
      </div>
      <button (click)="ajouterlivre()">Ajouter</button>
      <button (click)="annulerAjout()">Annuler</button>
    </div>

    <!-- affichage personnages -->
    <div *ngIf="personnages().length > 0">
      <h2>Personnages</h2>
      <div *ngFor="let p of personnages()">
        <strong>{{ p.prenom }} {{ p.nom }}</strong>
        <span>{{ p.description }}</span>
      </div>
    </div>

    <!-- affichage livres -->
    <div *ngIf="livres().length > 0">
      <h2>Livres</h2>
      <div *ngFor="let livre of livres()">
        <strong>{{ livre.nom }}</strong> - <span>{{ livre.type }}</span>
        <br>
        <span>{{ livre.description }}</span>
      </div>
    </div>
  `
})
export class App {
  // Adresse du serveur Java, en un seul endroit
  private apiUrl = 'http://localhost:8080';

  // Etat de l'application
  message = signal('');
  personnages = signal<any[]>([]);
  livres = signal<any[]>([]);
  showForm = signal(false);
  showSelection = signal(false);
  livreActive = signal<any>(null);

  nouvellelivre = {
    nom: '',
    type: 'livre',
    description: ''
  };

  private http = inject(HttpClient);

  constructor() {
    this.chargerLivres();
  }

  // ===== CREATION =====
  creerlivre() {
    this.showForm.set(true);
    this.showSelection.set(false);
    this.livreActive.set(null);
    this.message.set('Formulaire ajout livre');
    this.nouvellelivre = { nom: '', type: 'livre', description: '' };
  }

  annulerAjout() {
    this.showForm.set(false);
    this.message.set('Ajout annule');
  }

  ajouterlivre() {
    if (!this.nouvellelivre.nom.trim()) {
      this.message.set('Titre obligatoire');
      return;
    }

    this.http.post(`${this.apiUrl}/api/livres`, this.nouvellelivre)
      .subscribe({
        next: (response: any) => {
          this.message.set(`livre ajoutee (ID: ${response.id})`);
          this.showForm.set(false);
          this.chargerLivres();
          this.nouvellelivre = { nom: '', type: 'livre', description: '' };
        },
        error: (err) => {
          this.message.set('Erreur: ' + err.message);
        }
      });
  }

  reprendrelivre() {
    this.showForm.set(false);
    this.livreActive.set(null);
    this.showSelection.set(true);
    this.message.set('Choisissez un livre');
    this.chargerLivres();
  }

  ouvrirlivre(livre: any) {
    this.livreActive.set(livre);
    this.showSelection.set(false);
    this.message.set(`Livre "${livre.nom}" ouvert`);
    this.chargerPersonnagesDuLivre(livre.id); 
  }

  annulerSelection() {
    this.showSelection.set(false);
    this.message.set('');
  }

  fermerlivre() {
    this.livreActive.set(null);
    this.personnages.set([]);
    this.message.set('livre fermee');
  }

  chargerPersonnagesDuLivre(livreId: number) {
  this.message.set('Chargement personnages...');
  this.http.get(`${this.apiUrl}/api/personnages?livreId=${livreId}`)
    .subscribe({
      next: (data: any) => {
        this.personnages.set(data);
        this.message.set(`${data.length} personnage(s)`);
      },
      error: (err) => this.message.set('Erreur: ' + err.message)
    });
}

  chargerLivres() {
    this.message.set('Chargement livres...');
    this.http.get(`${this.apiUrl}/api/livres`)
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
    this.http.get(`${this.apiUrl}/test`, { responseType: 'text' })
      .subscribe({
        next: () => this.message.set('Connexion OK'),
        error: () => this.message.set('Erreur connexion')
      });
  }
}