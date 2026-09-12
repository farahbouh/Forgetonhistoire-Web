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
      <button (click)="creerlivre()">Creer un livre</button>
      <button (click)="reprendrelivre()">Reprendre un livre</button>
    </div>

    <div *ngIf="message()">
      {{ message() }}
    </div>

    <!-- LIVRE OUVERT -->
    <div *ngIf="livreActive()">
      <h2>{{ livreActive().nom }}</h2>
      <p><em>{{ livreActive().type }}</em></p>
      <p>{{ livreActive().description }}</p>
      <button (click)="fermerlivre()">Fermer</button>
    </div>

    <!-- UNIVERS DU LIVRE OUVERT -->
    <div *ngIf="livreActive()">
      <h2>Univers</h2>

      <div *ngIf="univers().length === 0">
        Aucun univers dans ce livre.
      </div>

      <div *ngFor="let u of univers()">
        <strong>{{ u.nom }}</strong>- <em>{{ u.type }}</em>
      </div>

      <button (click)="showFormUnivers.set(true)" *ngIf="!showFormUnivers()">
        + Nouvel univers
      </button>

      <div *ngIf="showFormUnivers()">
        <h3>Ajouter un univers</h3>
        <div>
          <label>Nom *</label>
          <input [(ngModel)]="nouvelUnivers.nom" placeholder="Terre du Milieu">
        </div>
        <div>
          <label>Type</label>
          <input [(ngModel)]="nouvelUnivers.type" placeholder="Fantastique">
        </div>
        <button (click)="ajouterUnivers()">Ajouter</button>
        <button (click)="showFormUnivers.set(false)">Annuler</button>
      </div>
    </div>

    <!-- PERSONNAGES DU LIVRE OUVERT -->
    <div *ngIf="personnages().length > 0">
      <h2>Personnages</h2>
      <div *ngFor="let p of personnages()">
        <strong>{{ p.prenom }} {{ p.nom }}</strong>
        <span>{{ p.description }}</span>
      </div>
    </div>

    <!-- CHOIX D'UN LIVRE -->
    <div *ngIf="showSelection()">
      <h2>Choisir un livre</h2>
      <div *ngIf="livres().length === 0">Aucun livre disponible.</div>
      <div *ngFor="let livre of livres()">
        <strong>{{ livre.nom }}</strong> - <span>{{ livre.type }}</span>
        <button (click)="ouvrirlivre(livre)">Reprendre</button>
      </div>
      <button (click)="annulerSelection()">Annuler</button>
    </div>

    <!-- FORMULAIRE CREATION LIVRE -->
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
  `
})
export class App {
  private apiUrl = 'http://localhost:8080';

  // État général
  message = signal('');
  livres = signal<any[]>([]);
  livreActive = signal<any>(null);
  personnages = signal<any[]>([]);
  univers = signal<any[]>([]);

  // Modes d'affichage
  showForm = signal(false);
  showSelection = signal(false);
  showFormUnivers = signal(false);

  // Formulaires
  nouvellelivre = { nom: '', type: 'Roman', description: '' };
  nouvelUnivers = { nom: '', type: '' };

  private http = inject(HttpClient);

  constructor() {
    this.chargerLivres();
  }

  // ===== CREATION LIVRE =====
  creerlivre() {
    this.showForm.set(true);
    this.showSelection.set(false);
    this.livreActive.set(null);
    this.personnages.set([]);
    this.univers.set([]);
    this.message.set('Formulaire ajout livre');
    this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
  }

  annulerAjout() {
    this.showForm.set(false);
    this.message.set('Ajout annulé');
  }

  ajouterlivre() {
    if (!this.nouvellelivre.nom.trim()) {
      this.message.set('Titre obligatoire');
      return;
    }

    this.http.post(`${this.apiUrl}/api/livres`, this.nouvellelivre)
      .subscribe({
        next: (response: any) => {
          this.message.set(`Livre ajouté (ID: ${response.id})`);
          this.showForm.set(false);
          this.chargerLivres();
          this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
        },
        error: (err) => this.message.set('Erreur: ' + err.message)
      });
  }

  // ===== REPRISE LIVRE =====
  reprendrelivre() {
    this.showForm.set(false);
    this.livreActive.set(null);
    this.personnages.set([]);
    this.univers.set([]);
    this.showSelection.set(true);
    this.message.set('Choisissez un livre');
    this.chargerLivres();
  }

  ouvrirlivre(livre: any) {
    this.livreActive.set(livre);
    this.showSelection.set(false);
    this.message.set(`Livre "${livre.nom}" ouvert`);
    this.chargerPersonnagesDuLivre(livre.id);
    this.chargerUniversDuLivre(livre.id);
  }

  annulerSelection() {
    this.showSelection.set(false);
    this.message.set('');
  }

  fermerlivre() {
    this.livreActive.set(null);
    this.personnages.set([]);
    this.univers.set([]);
    this.showFormUnivers.set(false);
    this.message.set('Livre fermé');
  }

  // ===== UNIVERS =====
  chargerUniversDuLivre(livreId: number) {
    this.http.get(`${this.apiUrl}/api/univers?livreId=${livreId}`)
      .subscribe({
        next: (data: any) => this.univers.set(data),
        error: (err) => this.message.set('Erreur: ' + err.message)
      });
  }

  ajouterUnivers() {
    if (!this.nouvelUnivers.nom.trim()) {
      this.message.set('Nom obligatoire');
      return;
    }
    const livre = this.livreActive();
    if (!livre) return;

    this.http.post(`${this.apiUrl}/api/univers?livreId=${livre.id}`, this.nouvelUnivers)
      .subscribe({
        next: () => {
          this.message.set('Univers ajouté');
          this.showFormUnivers.set(false);
          this.nouvelUnivers = { nom: '', type: '' };
          this.chargerUniversDuLivre(livre.id);
        },
        error: (err) => this.message.set('Erreur: ' + err.message)
      });
  }

  // ===== PERSONNAGES =====
  chargerPersonnagesDuLivre(livreId: number) {
    this.http.get(`${this.apiUrl}/api/personnages?livreId=${livreId}`)
      .subscribe({
        next: (data: any) => {
          this.personnages.set(data);
          this.message.set(`${data.length} personnage(s)`);
        },
        error: (err) => this.message.set('Erreur: ' + err.message)
      });
  }

  // ===== LIVRES =====
  chargerLivres() {
    this.message.set('Chargement livres...');
    this.http.get(`${this.apiUrl}/api/livres`)
      .subscribe({
        next: (data: any) => {
          this.livres.set(data);
          this.message.set(`${data.length} livre(s)`);
        },
        error: (err) => this.message.set('Erreur: ' + err.message)
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