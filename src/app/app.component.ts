import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Zones possibles pour afficher un message : chaque formulaire a la sienne + une zone globale
type ZoneMessage = 'livre' | 'univers' | 'personnage' | 'global' | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page">
    <h1>Forge ton histoire</h1>

    <!-- Boutons d'action principaux -->
    <div class="btn-groupe">
      <button (click)="creerlivre()">Creer un livre</button>
      <button (click)="reprendrelivre()">Reprendre un livre</button>
    </div>

    <!-- Message global -->
    <div *ngIf="message() && zoneMessage() === 'global'"
         class="message" [class.erreur]="estErreur()">
      {{ message() }}
    </div>

    <!-- LIVRE OUVERT -->
    <div *ngIf="livreActive()" class="section">
      <h2>{{ livreActive().nom }}</h2>
      <p><em>{{ livreActive().type }}</em></p>
      <p>{{ livreActive().description }}</p>
      <button class="secondaire isole" (click)="fermerlivre()">Fermer</button>
    </div>

    <!-- UNIVERS DU LIVRE OUVERT -->
    <div *ngIf="livreActive()" class="section">
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

        <!-- Liste des personnages : chaque personnage a deux modes (lecture / edition) -->
        <div *ngFor="let p of personnagesParUnivers()[u.id]" class="perso">
          <!-- MODE LECTURE -->
          <ng-container *ngIf="personnageEnEdition() !== p.id">
            <div class="perso-infos">
              <strong>{{ p.prenom }} {{ p.nom }}</strong>
              <span *ngIf="p.description"> - {{ p.description }}</span>
              <span *ngIf="p.dateNaissance?.tabdate">
                (né le {{ p.dateNaissance.tabdate[2].c }}/{{ p.dateNaissance.tabdate[1].c }}/{{ p.dateNaissance.tabdate[0].c }})
              </span>
              <span *ngIf="p.dateDeces?.tabdate">
                (décédé le {{ p.dateDeces.tabdate[2].c }}/{{ p.dateDeces.tabdate[1].c }}/{{ p.dateDeces.tabdate[0].c }})
              </span>
            </div>
            <button class="secondaire petit" (click)="ouvrirFormModifPersonnage(u.id, p)">
              Modifier
            </button>
          </ng-container>

          <!-- MODE EDITION -->
          <div *ngIf="personnageEnEdition() === p.id" class="perso-edition">
            <h5>Modifier {{ p.prenom }} {{ p.nom }}</h5>
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

            <div *ngIf="message() && zoneMessage() === 'personnage'"
                 class="message" [class.erreur]="estErreur()">
              {{ message() }}
            </div>

            <div class="btn-groupe">
              <button (click)="enregistrerPersonnage(u.id)">Enregistrer</button>
              <button class="secondaire" (click)="fermerFormPersonnage()">Annuler</button>
            </div>
          </div>
        </div>

        <!-- FORMULAIRE CREATION PERSONNAGE -->
        <div *ngIf="personnageEnCreation() && universEnCreation() === u.id" class="perso-edition">
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

          <div *ngIf="message() && zoneMessage() === 'personnage'"
               class="message" [class.erreur]="estErreur()">
            {{ message() }}
          </div>

          <div class="btn-groupe">
            <button (click)="enregistrerPersonnage(u.id)">Ajouter</button>
            <button class="secondaire" (click)="fermerFormPersonnage()">Annuler</button>
          </div>
        </div>

        <button class="isole" (click)="ouvrirFormPersonnage(u.id)"
                *ngIf="!personnageEnCreation() || universEnCreation() !== u.id">
          + Ajouter un personnage
        </button>
      </div>

      <button class="isole" (click)="showFormUnivers.set(true)" *ngIf="!showFormUnivers()">
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

        <div *ngIf="message() && zoneMessage() === 'univers'"
             class="message" [class.erreur]="estErreur()">
          {{ message() }}
        </div>

        <div class="btn-groupe">
          <button (click)="ajouterUnivers()">Ajouter</button>
          <button class="secondaire" (click)="showFormUnivers.set(false)">Annuler</button>
        </div>
      </div>
    </div>

    <!-- CHOIX D'UN LIVRE -->
    <div *ngIf="showSelection()" class="section">
      <h2>Choisir un livre</h2>
      <div *ngIf="livres().length === 0">Aucun livre disponible.</div>
      <div *ngFor="let livre of livres()" class="ligne-livre">
        <span><strong>{{ livre.nom }}</strong> - {{ livre.type }}</span>
        <button (click)="ouvrirlivre(livre)">Reprendre</button>
      </div>
      <button class="secondaire isole" (click)="annulerSelection()">Annuler</button>
    </div>

    <!-- FORMULAIRE LIVRE -->
    <div *ngIf="showForm()" class="section">
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

      <div *ngIf="message() && zoneMessage() === 'livre'"
           class="message" [class.erreur]="estErreur()">
        {{ message() }}
      </div>

      <div class="btn-groupe">
        <button (click)="ajouterlivre()">Ajouter</button>
        <button class="secondaire" (click)="annulerAjout()">Annuler</button>
      </div>
    </div>
    </main>
  `,
  styleUrl: './app.css'
})
export class App {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);

  // État global des messages
  message = signal('');
  zoneMessage = signal<ZoneMessage>(null);
  estErreur = computed(() => /erreur|incoh|obligatoire/i.test(this.message()));
  champsEnErreur = signal<string[]>([]);

  // Données
  livres = signal<any[]>([]);
  livreActive = signal<any>(null);
  univers = signal<any[]>([]);
  personnagesParUnivers = signal<{ [universId: number]: any[] }>({});

  // États d'interface
  showForm = signal(false);
  showSelection = signal(false);
  showFormUnivers = signal(false);

  // Edition inline d'un personnage (id du personnage en édition, null sinon)
  personnageEnEdition = signal<number | null>(null);
  // Création d'un personnage (id de l'univers concerné, null sinon)
  personnageEnCreation = signal<boolean>(false);
  universEnCreation = signal<number | null>(null);

  // Modèles de formulaire
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

  private reset() {
    this.champsEnErreur.set([]);
    this.message.set('');
    this.zoneMessage.set(null);
  }

  private afficher(msg: string, zone: ZoneMessage) {
    this.message.set(msg);
    this.zoneMessage.set(zone);
  }

  private gererErreur(err: any, zone: ZoneMessage = 'global') {
    const msg = err.error?.erreur ?? 'Erreur: ' + err.message;
    this.afficher(msg, zone);
    if (/incoh/i.test(msg)) {
      this.champsEnErreur.set([
        'dateNaisJour', 'dateNaisMois', 'dateNaisAnnee',
        'dateDecesJour', 'dateDecesMois', 'dateDecesAnnee'
      ]);
    }
  }

  private envoyer(
    methode: 'POST' | 'PUT',
    url: string,
    payload: any,
    onSuccess: () => void,
    zone: ZoneMessage = 'global'
  ) {
    const requete = methode === 'PUT'
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    requete.subscribe({
      next: onSuccess,
      error: (err) => this.gererErreur(err, zone)
    });
  }

  // Actions principales

  creerlivre() {
    this.showForm.set(true);
    this.showSelection.set(false);
    this.fermerLivreInterne();
    this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
    this.reset();
    this.afficher('Formulaire ajout livre', 'livre');
  }

  reprendrelivre() {
    this.showForm.set(false);
    this.fermerLivreInterne();
    this.showSelection.set(true);
    this.afficher('Choisissez un livre', 'global');
    this.chargerLivres();
  }

  ouvrirlivre(livre: any) {
    this.livreActive.set(livre);
    this.showSelection.set(false);
    this.afficher(`Livre "${livre.nom}" ouvert`, 'global');
    this.chargerUniversDuLivre(livre.id);
  }

  fermerlivre() {
    this.fermerLivreInterne();
    this.afficher('Livre fermé', 'global');
  }

  private fermerLivreInterne() {
    this.livreActive.set(null);
    this.univers.set([]);
    this.personnagesParUnivers.set({});
    this.showFormUnivers.set(false);
    this.personnageEnEdition.set(null);
    this.personnageEnCreation.set(false);
    this.universEnCreation.set(null);
    this.reset();
  }

  annulerAjout() {
    this.showForm.set(false);
    this.reset();
  }

  annulerSelection() {
    this.showSelection.set(false);
    this.reset();
  }

  // Livres

  ajouterlivre() {
    if (!this.nouvellelivre.nom.trim()) {
      this.afficher('Titre obligatoire', 'livre');
      this.champsEnErreur.set(['nom']);
      return;
    }
    this.reset();

    this.envoyer('POST', `${this.apiUrl}/api/livres`, this.nouvellelivre, () => {
      this.showForm.set(false);
      this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
      this.chargerLivres();
      this.afficher('Livre ajouté', 'global');
    }, 'livre');
  }

  chargerLivres() {
    this.http.get(`${this.apiUrl}/api/livres`).subscribe({
      next: (data: any) => {
        this.livres.set(data);
        if (!this.zoneMessage() || this.zoneMessage() === 'global') {
          this.afficher(`${data.length} livre(s)`, 'global');
        }
      },
      error: (err) => this.gererErreur(err, 'global')
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
      error: (err) => this.gererErreur(err, 'global')
    });
  }

  ajouterUnivers() {
    if (!this.nouvelUnivers.nom.trim()) {
      this.afficher('Nom obligatoire', 'univers');
      this.champsEnErreur.set(['universNom']);
      return;
    }
    this.reset();

    const livre = this.livreActive();
    if (!livre) return;

    const url = `${this.apiUrl}/api/univers?livreId=${livre.id}`;
    this.envoyer('POST', url, this.nouvelUnivers, () => {
      this.showFormUnivers.set(false);
      this.nouvelUnivers = { nom: '', type: '' };
      this.chargerUniversDuLivre(livre.id);
      this.afficher('Univers ajouté', 'global');
    }, 'univers');
  }

  // Personnages

  chargerPersonnagesDeUnivers(universId: number) {
    this.http.get(`${this.apiUrl}/api/personnages?universId=${universId}`).subscribe({
      next: (data: any) => {
        const copie = { ...this.personnagesParUnivers() };
        copie[universId] = data;
        this.personnagesParUnivers.set(copie);
      },
      error: (err) => this.gererErreur(err, 'global')
    });
  }

  // Ouvre le formulaire de creation de personnage pour un univers
  ouvrirFormPersonnage(universId: number) {
    this.personnageEnEdition.set(null);
    this.personnageEnCreation.set(true);
    this.universEnCreation.set(universId);
    this.nouveauPersonnage = this.personnageVide();
    this.reset();
  }

  // Ouvre l'edition inline d'un personnage existant
  ouvrirFormModifPersonnage(universId: number, p: any) {
    this.personnageEnEdition.set(p.id);
    this.personnageEnCreation.set(false);
    this.universEnCreation.set(null);

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

  // Ferme l'edition ou la creation de personnage
  fermerFormPersonnage() {
    this.personnageEnEdition.set(null);
    this.personnageEnCreation.set(false);
    this.universEnCreation.set(null);
    this.reset();
  }

  // Valide et envoie la creation ou la modification d'un personnage
  enregistrerPersonnage(universId: number) {
    const erreurs: string[] = [];
    if (!this.nouveauPersonnage.nom.trim()) erreurs.push('persoNom');
    if (!this.nouveauPersonnage.prenom.trim()) erreurs.push('persoPrenom');

    if (erreurs.length > 0) {
      this.afficher('Nom et prenom obligatoires', 'personnage');
      this.champsEnErreur.set(erreurs);
      return;
    }
    this.reset();

    const idEdition = this.personnageEnEdition();
    const url = `${this.apiUrl}/api/personnages?universId=${universId}`;

    if (idEdition !== null) {
      // Modification
      const payload = { ...this.nouveauPersonnage, id: idEdition };
      this.envoyer('PUT', url, payload, () => {
        this.personnageEnEdition.set(null);
        this.nouveauPersonnage = this.personnageVide();
        this.chargerPersonnagesDeUnivers(universId);
        this.afficher('Personnage modifié', 'global');
      }, 'personnage');
    } else {
      // Creation
      this.envoyer('POST', url, this.nouveauPersonnage, () => {
        this.personnageEnCreation.set(false);
        this.universEnCreation.set(null);
        this.nouveauPersonnage = this.personnageVide();
        this.chargerPersonnagesDeUnivers(universId);
        this.afficher('Personnage ajouté', 'global');
      }, 'personnage');
    }
  }
}