import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';
import { MessageComponent } from '../message/message.component';
import { PersonnageComponent } from '../personnage/personnage.component';

@Component({
  selector: 'app-livre',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageComponent, PersonnageComponent],
  templateUrl: './livre.component.html',
  styleUrl: './livre.component.css'
})
export class LivreComponent {
  private api = inject(ApiService);
  private messages = inject(MessageService);
  champsEnErreur = this.messages.champsEnErreur;

  // Données
  livres = signal<any[]>([]);
  livreActive = signal<any>(null);
  univers = signal<any[]>([]);

  // États d'interface
  showForm = signal(false);
  showSelection = signal(false);
  showFormUnivers = signal(false);

  // Modèles de formulaire
  nouvellelivre = { nom: '', type: 'Roman', description: '' };
  nouvelUnivers = { nom: '', type: '' };

  constructor() {
    this.chargerLivres();
  }

  // Garde les composants personnage existants quand la liste d'univers est rechargée
  trackById = (_: number, u: any) => u.id;

  // Actions principales

  creerlivre() {
    this.showForm.set(true);
    this.showSelection.set(false);
    this.fermerLivreInterne();
    this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
    this.messages.reset();
    this.messages.afficher('Formulaire ajout livre', 'livre');
  }

  reprendrelivre() {
    this.showForm.set(false);
    this.fermerLivreInterne();
    this.showSelection.set(true);
    this.messages.afficher('Choisissez un livre', 'global');
    this.chargerLivres();
  }

  ouvrirlivre(livre: any) {
    this.livreActive.set(livre);
    this.showSelection.set(false);
    this.messages.afficher(`Livre "${livre.nom}" ouvert`, 'global');
    this.chargerUniversDuLivre(livre.id);
  }

  fermerlivre() {
    this.fermerLivreInterne();
    this.messages.afficher('Livre fermé', 'global');
  }

  private fermerLivreInterne() {
    this.livreActive.set(null);
    this.univers.set([]);
    this.showFormUnivers.set(false);
    this.messages.reset();
  }

  annulerAjout() {
    this.showForm.set(false);
    this.messages.reset();
  }

  annulerSelection() {
    this.showSelection.set(false);
    this.messages.reset();
  }

  // Livres

  ajouterlivre() {
    if (!this.nouvellelivre.nom.trim()) {
      this.messages.afficher('Titre obligatoire', 'livre');
      this.champsEnErreur.set(['nom']);
      return;
    }
    this.messages.reset();

    this.api.envoyer('POST', '/api/livres', this.nouvellelivre, () => {
      this.showForm.set(false);
      this.nouvellelivre = { nom: '', type: 'Roman', description: '' };
      this.chargerLivres();
      this.messages.afficher('Livre ajouté', 'global');
    }, 'livre');
  }

  chargerLivres() {
    this.api.get<any[]>('/api/livres', (data) => {
      this.livres.set(data);
      const zone = this.messages.zoneMessage();
      if (!zone || zone === 'global') {
        this.messages.afficher(`${data.length} livre(s)`, 'global');
      }
    });
  }

  // Univers (les personnages sont gérés par <app-personnage>)

  chargerUniversDuLivre(livreId: number) {
    this.api.get<any[]>(`/api/univers?livreId=${livreId}`, (data) => this.univers.set(data));
  }

  ajouterUnivers() {
    if (!this.nouvelUnivers.nom.trim()) {
      this.messages.afficher('Nom obligatoire', 'univers');
      this.champsEnErreur.set(['universNom']);
      return;
    }
    this.messages.reset();

    const livre = this.livreActive();
    if (!livre) return;

    this.api.envoyer('POST', `/api/univers?livreId=${livre.id}`, this.nouvelUnivers, () => {
      this.showFormUnivers.set(false);
      this.nouvelUnivers = { nom: '', type: '' };
      this.chargerUniversDuLivre(livre.id);
      this.messages.afficher('Univers ajouté', 'global');
    }, 'univers');
  }
}
