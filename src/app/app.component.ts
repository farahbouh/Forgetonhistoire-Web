import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page">
    <h1>Forge ton histoire</h1>

    <div>
      <button (click)="creerlivre()">Creer un livre</button>
      <button (click)="reprendrelivre()">Reprendre un livre</button>
    </div>

    <div *ngIf="message()" class="message" [class.erreur]="estErreur()">
      {{ message() }}
    </div>

    <!-- LIVRE OUVERT -->
    <div *ngIf="livreActive()">
      <h2>{{ livreActive().nom }}</h2>
      <p><em>{{ livreActive().type }}</em></p>
      <p>{{ livreActive().description }}</p>
      <button class="secondaire" (click)="fermerlivre()">Fermer</button>
    </div>

    <!-- UNIVERS DU LIVRE OUVERT -->
    <div *ngIf="livreActive()">
      <h2>Univers</h2>

      <div *ngIf="univers().length === 0">
        Aucun univers dans ce livre.
      </div>

      <div *ngFor="let u of univers()" class="carte">
        <h3>{{ u.nom }} <em>({{ u.type }})</em></h3>

        <!-- PERSONNAGES DE CET UNIVERS -->
        <h4>Personnages</h4>
        <div *ngIf="personnagesParUnivers()[u.id]?.length === 0">
          Aucun personnage dans cet univers.
        </div>
        <div *ngFor="let p of personnagesParUnivers()[u.id]" class="perso">
          <strong>{{ p.prenom }} {{ p.nom }}</strong> - <span>{{ p.description }}</span>
          <span *ngIf="p.dateNaissance && p.dateNaissance.tabdate">
  (né le {{ p.dateNaissance.tabdate[2].c }}/{{ p.dateNaissance.tabdate[1].c }}/{{ p.dateNaissance.tabdate[0].c }})
</span>
          <span *ngIf="p.dateDeces && p.dateDeces.tabdate">
            (décédé le {{ p.dateDeces.tabdate[2].c }}/{{ p.dateDeces.tabdate[1].c }}/{{ p.dateDeces.tabdate[0].c }})
          </span>
        </div>

        <!-- Bouton pour ouvrir le formulaire de ce univers -->
        <button (click)="ouvrirFormPersonnage(u.id)">
          + Ajouter un personnage
        </button>

        <!-- Formulaire de création de personnage -->
        <div *ngIf="showFormPersonnage() === u.id">
          <h5>Nouveau personnage dans {{ u.nom }}</h5>
          <div>
            <label>Nom</label>
            <input [(ngModel)]="nouveauPersonnage.nom" placeholder="Baggins"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('persoNom')">
          </div>
          <div>
            <label>Prénom</label>
            <input [(ngModel)]="nouveauPersonnage.prenom" placeholder="Frodon"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('persoPrenom')">
          </div>
          <div>
            <label>Description</label>
            <input [(ngModel)]="nouveauPersonnage.description" placeholder="Porteur de l'Anneau">
          </div>
          <div class="dates">
          <div>
            <label>Jour de naissance</label>
            <input type="number" [(ngModel)]="nouveauPersonnage.jour" placeholder="15"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('dateNaisJour')">
          </div>
          <div>
            <label>Mois de naissance</label>
            <input type="number" [(ngModel)]="nouveauPersonnage.mois" placeholder="6"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('dateNaisMois')">
          </div>
          <div>
            <label>Année de naissance</label>
            <input type="number" [(ngModel)]="nouveauPersonnage.annee" placeholder="2968"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('dateNaisAnnee')">
          </div>
          </div>
          <div class="dates">
          <div>
            <label>Jour de décès</label>
            <input type="number" [(ngModel)]="nouveauPersonnage.jourDeces"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('dateDecesJour')">
          </div>
          <div>
            <label>Mois de décès</label>
            <input type="number" [(ngModel)]="nouveauPersonnage.moisDeces"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('dateDecesMois')">
          </div>
          <div>
            <label>Année de décès</label>
            <input type="number" [(ngModel)]="nouveauPersonnage.anneeDeces"
                   (input)="champsEnErreur.set([])"
                   [class.champ-erreur]="champsEnErreur().includes('dateDecesAnnee')">
          </div>
          </div>
          <button (click)="ajouterPersonnage(u.id)">Ajouter</button>
          <button class="secondaire" (click)="fermerFormPersonnage()">Annuler</button>
        </div>
      </div>

      <button (click)="showFormUnivers.set(true)" *ngIf="!showFormUnivers()">
        + Nouvel univers
      </button>

      <div *ngIf="showFormUnivers()">
        <h3>Ajouter un univers</h3>
        <div>
          <label>Nom *</label>
          <input [(ngModel)]="nouvelUnivers.nom" placeholder="Terre du Milieu"
                 (input)="champsEnErreur.set([])"
                 [class.champ-erreur]="champsEnErreur().includes('universNom')">
        </div>
        <div>
          <label>Type</label>
          <input [(ngModel)]="nouvelUnivers.type" placeholder="Fantastique">
        </div>
        <button (click)="ajouterUnivers()">Ajouter</button>
        <button class="secondaire" (click)="showFormUnivers.set(false)">Annuler</button>
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
      <button class="secondaire" (click)="annulerSelection()">Annuler</button>
    </div>

    <!-- FORMULAIRE CREATION LIVRE -->
    <div *ngIf="showForm()">
      <h2>Ajouter un livre</h2>
      <div>
        <label>Titre *</label>
        <input [(ngModel)]="nouvellelivre.nom" placeholder="Titre"
               (input)="champsEnErreur.set([])"
               [class.champ-erreur]="champsEnErreur().includes('nom')">
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
      <button class="secondaire" (click)="annulerAjout()">Annuler</button>
    </div>
    </main>
  `,
  styleUrl: './app.css'
})
export class App {
  private apiUrl = 'http://localhost:8080';

  // État général
  message = signal('');
  estErreur = computed(() => /erreur|incoh|obligatoire/i.test(this.message()));
  livres = signal<any[]>([]);
  livreActive = signal<any>(null);
  univers = signal<any[]>([]);
  personnagesParUnivers = signal<{ [universId: number]: any[] }>({});

  // Modes d'affichage
  showForm = signal(false);
  showSelection = signal(false);
  showFormUnivers = signal(false);
  showFormPersonnage = signal<number | null>(null);
  champsEnErreur = signal<string[]>([]);

  // Formulaires
  nouvellelivre = { nom: '', type: 'Roman', description: '' };
  nouvelUnivers = { nom: '', type: '' };
  personnageVide() {
    return {
      nom: '',
      prenom: '',
      description: '',
      jour: null as number | null,
      mois: null as number | null,
      annee: null as number | null,
      jourDeces: null as number | null,
      moisDeces: null as number | null,
      anneeDeces: null as number | null
    };
  }
  nouveauPersonnage = this.personnageVide();

  private http = inject(HttpClient);

  constructor() {
    this.chargerLivres();
  }

  // ===== CREATION LIVRE =====
  creerlivre() {
    this.showForm.set(true);
    this.showSelection.set(false);
    this.livreActive.set(null);
    this.univers.set([]);
    this.personnagesParUnivers.set({});
    this.message.set('Formulaire ajout livre');
    this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
    this.champsEnErreur.set([]);
  }

  annulerAjout() {
    this.showForm.set(false);
    this.message.set('Ajout annulé');
    this.champsEnErreur.set([]);
  }

  ajouterlivre() {
    if (!this.nouvellelivre.nom.trim()) {
      this.message.set('Titre obligatoire');
      this.champsEnErreur.set(['nom']);
      return;
    }
    this.champsEnErreur.set([]);

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
    this.univers.set([]);
    this.personnagesParUnivers.set({});
    this.showSelection.set(true);
    this.message.set('Choisissez un livre');
    this.chargerLivres();
  }

  ouvrirlivre(livre: any) {
    this.livreActive.set(livre);
    this.showSelection.set(false);
    this.message.set(`Livre "${livre.nom}" ouvert`);
    this.chargerUniversDuLivre(livre.id);
  }

  annulerSelection() {
    this.showSelection.set(false);
    this.message.set('');
  }

  fermerlivre() {
    this.livreActive.set(null);
    this.univers.set([]);
    this.personnagesParUnivers.set({});
    this.showFormUnivers.set(false);
    this.showFormPersonnage.set(null);
    this.message.set('Livre fermé');
  }

  // ===== UNIVERS =====
  chargerUniversDuLivre(livreId: number) {
    this.http.get(`${this.apiUrl}/api/univers?livreId=${livreId}`)
      .subscribe({
        next: (data: any) => {
          this.univers.set(data);
          for (const u of data) {
            this.chargerPersonnagesDeUnivers(u.id);
          }
        },
        error: (err) => this.message.set('Erreur: ' + err.message)
      });
  }

  ajouterUnivers() {
    if (!this.nouvelUnivers.nom.trim()) {
      this.message.set('Nom obligatoire');
      this.champsEnErreur.set(['universNom']);
      return;
    }
    this.champsEnErreur.set([]);
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
  chargerPersonnagesDeUnivers(universId: number) {
    this.http.get(`${this.apiUrl}/api/personnages?universId=${universId}`)
      .subscribe({
        next: (data: any) => {
          const copie = { ...this.personnagesParUnivers() };
          copie[universId] = data;
          this.personnagesParUnivers.set(copie);
        },
        error: (err) => this.message.set('Erreur: ' + err.message)
      });
  }

  ouvrirFormPersonnage(universId: number) {
    this.showFormPersonnage.set(universId);
    this.nouveauPersonnage = this.personnageVide();
    this.champsEnErreur.set([]);
  }

  fermerFormPersonnage() {
    this.showFormPersonnage.set(null);
    this.champsEnErreur.set([]);
  }

  ajouterPersonnage(universId: number) {
    const erreurs: string[] = [];
    if (!this.nouveauPersonnage.nom.trim()) erreurs.push('persoNom');
    if (!this.nouveauPersonnage.prenom.trim()) erreurs.push('persoPrenom');

    if (erreurs.length > 0) {
      this.message.set('Nom et prenom obligatoires');
      this.champsEnErreur.set(erreurs);
      return;
    }
    this.champsEnErreur.set([]);

    // Debug : voir ce qu'on envoie au serveur
    console.log('>>> ENVOI :', JSON.stringify(this.nouveauPersonnage));

    this.http.post(`${this.apiUrl}/api/personnages?universId=${universId}`, this.nouveauPersonnage)
      .subscribe({
        next: () => {
          this.message.set('Personnage ajouté');
          this.showFormPersonnage.set(null);
          this.nouveauPersonnage = this.personnageVide();
          this.chargerPersonnagesDeUnivers(universId);
        },
        error: (err) => {
          // Debug : voir ce que le serveur renvoie
          console.log('>>> ERREUR SERVEUR :', err.status, err.error);

          const msg = err.error?.erreur ?? 'Erreur: ' + err.message;
          this.message.set(msg);

          // Si c'est une incohérence de dates → encadrer les 6 champs de date
          if (/incoh/i.test(msg)) {
            this.champsEnErreur.set([
              'dateNaisJour', 'dateNaisMois', 'dateNaisAnnee',
              'dateDecesJour', 'dateDecesMois', 'dateDecesAnnee'
            ]);
          }
        }
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