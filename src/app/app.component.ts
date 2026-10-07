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

        <!-- PERSONNAGES -->
        <h4>Personnages</h4>
        <div *ngIf="personnagesParUnivers()[u.id]?.length === 0">
          Aucun personnage dans cet univers.
        </div>
        <div *ngFor="let p of personnagesParUnivers()[u.id]" class="perso">
          <strong>{{ p.prenom }} {{ p.nom }}</strong> - <span>{{ p.description }}</span>
          <span *ngIf="p.dateNaissance?.tabdate">
            (né le {{ p.dateNaissance.tabdate[2].c }}/{{ p.dateNaissance.tabdate[1].c }}/{{ p.dateNaissance.tabdate[0].c }})
          </span>
          <span *ngIf="p.dateDeces?.tabdate">
            (décédé le {{ p.dateDeces.tabdate[2].c }}/{{ p.dateDeces.tabdate[1].c }}/{{ p.dateDeces.tabdate[0].c }})
          </span>
          <button class="secondaire petit" (click)="ouvrirFormModifPersonnage(u.id, p)">
            Modifier
          </button>
        </div>

        <button (click)="ouvrirFormPersonnage(u.id)">
          + Ajouter un personnage
        </button>

        <!-- FORMULAIRE PERSONNAGE -->
        <div *ngIf="showFormPersonnage() === u.id">
          <h5>{{ personnageEnEdition() === null ? 'Nouveau' : 'Modifier le' }} personnage dans {{ u.nom }}</h5>
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
          <button (click)="enregistrerPersonnage(u.id)">
            {{ personnageEnEdition() === null ? 'Ajouter' : 'Enregistrer' }}
          </button>
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

    <!-- FORMULAIRE LIVRE -->
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
  private http = inject(HttpClient);

  // État
  message = signal('');
  estErreur = computed(() => /erreur|incoh|obligatoire/i.test(this.message()));
  champsEnErreur = signal<string[]>([]);

  livres = signal<any[]>([]);
  livreActive = signal<any>(null);
  univers = signal<any[]>([]);
  personnagesParUnivers = signal<{ [universId: number]: any[] }>({});

  showForm = signal(false);
  showSelection = signal(false);
  showFormUnivers = signal(false);
  showFormPersonnage = signal<number | null>(null);
  personnageEnEdition = signal<number | null>(null);

  nouvellelivre = { nom: '', type: 'Roman', description: '' };
  nouvelUnivers = { nom: '', type: '' };
  nouveauPersonnage = this.personnageVide();

  constructor() {
    this.chargerLivres();
  }

  // Helpers

  private personnageVide() {
    return {
      nom: '', prenom: '', description: '',
      jour: null as number | null, mois: null as number | null, annee: null as number | null,
      jourDeces: null as number | null, moisDeces: null as number | null, anneeDeces: null as number | null
    };
  }

  // Efface les messages et les champs en erreur
  private reset() {
    this.champsEnErreur.set([]);
    this.message.set('');
  }

  // Gère une erreur de requête
  private gererErreur(err: any) {
    const msg = err.error?.erreur ?? 'Erreur: ' + err.message;
    this.message.set(msg);
    if (/incoh/i.test(msg)) {
      this.champsEnErreur.set([
        'dateNaisJour', 'dateNaisMois', 'dateNaisAnnee',
        'dateDecesJour', 'dateDecesMois', 'dateDecesAnnee'
      ]);
    }
  }

  // Envoie une requête HTTP (POST ou PUT) et gère succès/erreur
  private envoyer(methode: 'POST' | 'PUT', url: string, payload: any, onSuccess: () => void) {
    let requete;
    if (methode === 'PUT') {
      requete = this.http.put(url, payload);
    } else {
      requete = this.http.post(url, payload);
    }

    requete.subscribe({
      next: onSuccess,
      error: (err) => this.gererErreur(err)
    });
  }

  // Actions principales

  creerlivre() {
    this.showForm.set(true);
    this.showSelection.set(false);
    this.fermerLivreInterne();
    this.message.set('Formulaire ajout livre');
    this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
    this.reset();
  }

  reprendrelivre() {
    this.showForm.set(false);
    this.fermerLivreInterne();
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

  fermerlivre() {
    this.fermerLivreInterne();
    this.message.set('Livre fermé');
  }

  private fermerLivreInterne() {
    this.livreActive.set(null);
    this.univers.set([]);
    this.personnagesParUnivers.set({});
    this.showFormUnivers.set(false);
    this.showFormPersonnage.set(null);
    this.personnageEnEdition.set(null);
    this.reset();
  }

  annulerAjout() {
    this.showForm.set(false);
    this.message.set('Ajout annulé');
    this.reset();
  }

  annulerSelection() {
    this.showSelection.set(false);
    this.message.set('');
  }

  // Livres

  ajouterlivre() {
    if (!this.nouvellelivre.nom.trim()) {
      this.message.set('Titre obligatoire');
      this.champsEnErreur.set(['nom']);
      return;
    }
    this.reset();

    this.envoyer('POST', `${this.apiUrl}/api/livres`, this.nouvellelivre, () => {
      this.message.set('Livre ajouté');
      this.showForm.set(false);
      this.chargerLivres();
      this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
    });
  }

  chargerLivres() {
    this.message.set('Chargement livres...');
    this.http.get(`${this.apiUrl}/api/livres`).subscribe({
      next: (data: any) => {
        this.livres.set(data);
        this.message.set(`${data.length} livre(s)`);
      },
      error: (err) => this.gererErreur(err)
    });
  }

  // Univers

  chargerUniversDuLivre(livreId: number) {
    this.http.get(`${this.apiUrl}/api/univers?livreId=${livreId}`).subscribe({
      next: (data: any) => {
        this.univers.set(data);
        for (const u of data) {
          this.chargerPersonnagesDeUnivers(u.id);
        }
      },
      error: (err) => this.gererErreur(err)
    });
  }

  ajouterUnivers() {
    if (!this.nouvelUnivers.nom.trim()) {
      this.message.set('Nom obligatoire');
      this.champsEnErreur.set(['universNom']);
      return;
    }
    this.reset();

    const livre = this.livreActive();
    if (!livre) return;

    const url = `${this.apiUrl}/api/univers?livreId=${livre.id}`;
    this.envoyer('POST', url, this.nouvelUnivers, () => {
      this.message.set('Univers ajouté');
      this.showFormUnivers.set(false);
      this.nouvelUnivers = { nom: '', type: '' };
      this.chargerUniversDuLivre(livre.id);
    });
  }

  // Personnages

  chargerPersonnagesDeUnivers(universId: number) {
    this.http.get(`${this.apiUrl}/api/personnages?universId=${universId}`).subscribe({
      next: (data: any) => {
        const copie = { ...this.personnagesParUnivers() };
        copie[universId] = data;
        this.personnagesParUnivers.set(copie);
      },
      error: (err) => this.gererErreur(err)
    });
  }

  ouvrirFormPersonnage(universId: number) {
    this.showFormPersonnage.set(universId);
    this.personnageEnEdition.set(null);
    this.nouveauPersonnage = this.personnageVide();
    this.reset();
  }

  ouvrirFormModifPersonnage(universId: number, p: any) {
    this.showFormPersonnage.set(universId);
    this.personnageEnEdition.set(p.id);

    // Récupère les dates depuis tabdate (ordre : année, mois, jour)
    const nais = p.dateNaissance?.tabdate;
    const deces = p.dateDeces?.tabdate;

    this.nouveauPersonnage = {
      nom: p.nom ?? '',
      prenom: p.prenom ?? '',
      description: p.description ?? '',
      jour: nais?.[2]?.c ?? null,
      mois: nais?.[1]?.c ?? null,
      annee: nais?.[0]?.c ?? null,
      jourDeces: deces?.[2]?.c ?? null,
      moisDeces: deces?.[1]?.c ?? null,
      anneeDeces: deces?.[0]?.c ?? null
    };
    this.reset();
  }

  fermerFormPersonnage() {
    this.showFormPersonnage.set(null);
    this.personnageEnEdition.set(null);
    this.reset();
  }

  enregistrerPersonnage(universId: number) {
    // Validation
    const erreurs: string[] = [];
    if (!this.nouveauPersonnage.nom.trim()) {
      erreurs.push('persoNom');
    }
    if (!this.nouveauPersonnage.prenom.trim()) {
      erreurs.push('persoPrenom');
    }

    if (erreurs.length > 0) {
      this.message.set('Nom et prenom obligatoires');
      this.champsEnErreur.set(erreurs);
      return;
    }
    this.reset();

    const idEdition = this.personnageEnEdition();
    const url = `${this.apiUrl}/api/personnages?universId=${universId}`;

    if (idEdition !== null) {
      // Modification : on ajoute l'id au payload et on envoie un PUT
      const payload = { ...this.nouveauPersonnage, id: idEdition };
      this.envoyer('PUT', url, payload, () => {
        this.message.set('Personnage modifié');
        this.showFormPersonnage.set(null);
        this.personnageEnEdition.set(null);
        this.nouveauPersonnage = this.personnageVide();
        this.chargerPersonnagesDeUnivers(universId);
      });
    } else {
      // Création : on envoie un POST
      this.envoyer('POST', url, this.nouveauPersonnage, () => {
        this.message.set('Personnage ajouté');
        this.showFormPersonnage.set(null);
        this.nouveauPersonnage = this.personnageVide();
        this.chargerPersonnagesDeUnivers(universId);
      });
    }
  }

  // Test

  testerConnexion() {
    this.message.set('Test connexion...');
    this.http.get(`${this.apiUrl}/test`, { responseType: 'text' }).subscribe({
      next: () => this.message.set('Connexion OK'),
      error: () => this.message.set('Erreur connexion')
    });
  }
}