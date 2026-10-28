import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-personnage',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageComponent],
  templateUrl: './personnage.component.html',
  styleUrl: './personnage.component.css'
})
export class PersonnageComponent implements OnInit {
  // Univers auquel appartiennent les personnages affichés
  univers = input.required<any>();

  private api = inject(ApiService);
  private messages = inject(MessageService);
  champsEnErreur = this.messages.champsEnErreur;

  // null tant que le chargement n'est pas terminé
  personnages = signal<any[] | null>(null);

  // Année testée par personnage (clé = id du personnage)
  anneeTest: { [personnageId: number]: number | null } = {};

  // Edition inline (id du personnage en édition, null sinon) / création
  personnageEnEdition = signal<number | null>(null);
  personnageEnCreation = signal(false);

  nouveauPersonnage = this.personnageVide();

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.api.get<any[]>(
      `/api/personnages?universId=${this.univers().id}`,
      (data) => this.personnages.set(data)
    );
  }

  // Helpers

  private personnageVide() {
    return {
      nom: '', prenom: '', description: '',
      jour: null as number | null, mois: null as number | null, annee: null as number | null,
      jourDeces: null as number | null, moisDeces: null as number | null, anneeDeces: null as number | null
    };
  }

  // Âge au décès (null si les deux dates ne sont pas renseignées)
  ageAuDeces(p: any): number | null {
    const nais = p.dateNaissance?.tabdate?.[0]?.c;
    const deces = p.dateDeces?.tabdate?.[0]?.c;
    if (nais == null || deces == null) return null;
    return deces - nais;
  }

  // Retourne 'pas-ne', 'vivant', 'mort' ou null (si aucune année saisie)
  // Convention : mort à partir de l'année de décès incluse
  statut(p: any, annee: number | null): 'pas-ne' | 'vivant' | 'mort' | null {
    if (annee == null) return null;
    const nais = p.dateNaissance?.tabdate?.[0]?.c;
    const deces = p.dateDeces?.tabdate?.[0]?.c;

    // Pas encore né
    if (nais != null && annee < nais) return 'pas-ne';

    // Mort à partir de l'année de décès incluse
    if (deces != null && annee >= deces) return 'mort';

    // Vivant
    return 'vivant';
  }

  // Texte d'âge adapté aux 3 statuts
  texteAge(p: any, annee: number | null): string {
    if (annee == null) return '';

    const nais = p.dateNaissance?.tabdate?.[0]?.c;
    const deces = p.dateDeces?.tabdate?.[0]?.c;

    const statut = this.statut(p, annee);

    // Pas encore né
    if (statut === 'pas-ne' && nais != null) {
      const dansN = nais - annee;
      return `naîtra dans ${dansN} an${dansN > 1 ? 's' : ''}`;
    }

    // Mort
    if (statut === 'mort') {
      // Mort pendant l'année de décès → âge au décès
      if (deces != null && annee === deces && nais != null) {
        return `mort à ${deces - nais} ans`;
      }
      return '';
    }

    // Vivant
    if (nais != null) {
      const age = annee - nais;
      if (age === 0) return 'né cette année';
      return `${age} ans cette année`;
    }

    return '';
  }

  // Formulaires

  // Ouvre le formulaire de creation de personnage
  ouvrirFormPersonnage() {
    this.personnageEnEdition.set(null);
    this.personnageEnCreation.set(true);
    this.nouveauPersonnage = this.personnageVide();
    this.messages.reset();
  }

  // Ouvre l'edition inline d'un personnage existant
  ouvrirFormModifPersonnage(p: any) {
    this.personnageEnEdition.set(p.id);
    this.personnageEnCreation.set(false);

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
    this.messages.reset();
  }

  // Ferme l'edition ou la creation de personnage
  fermerFormPersonnage() {
    this.personnageEnEdition.set(null);
    this.personnageEnCreation.set(false);
    this.messages.reset();
  }

  // Valide et envoie la creation ou la modification d'un personnage
  enregistrerPersonnage() {
    const erreurs: string[] = [];
    if (!this.nouveauPersonnage.nom.trim()) erreurs.push('persoNom');
    if (!this.nouveauPersonnage.prenom.trim()) erreurs.push('persoPrenom');

    if (erreurs.length > 0) {
      this.messages.afficher('Nom et prenom obligatoires', 'personnage');
      this.champsEnErreur.set(erreurs);
      return;
    }
    this.messages.reset();

    const idEdition = this.personnageEnEdition();
    const chemin = `/api/personnages?universId=${this.univers().id}`;

    if (idEdition !== null) {
      const payload = { ...this.nouveauPersonnage, id: idEdition };
      this.api.envoyer('PUT', chemin, payload, () => {
        this.personnageEnEdition.set(null);
        this.nouveauPersonnage = this.personnageVide();
        this.charger();
        this.messages.afficher('Personnage modifié', 'global');
      }, 'personnage');
    } else {
      this.api.envoyer('POST', chemin, this.nouveauPersonnage, () => {
        this.personnageEnCreation.set(false);
        this.nouveauPersonnage = this.personnageVide();
        this.charger();
        this.messages.afficher('Personnage ajouté', 'global');
      }, 'personnage');
    }
  }
}
