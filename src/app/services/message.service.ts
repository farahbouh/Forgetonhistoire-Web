import { Injectable, computed, signal } from '@angular/core';

// Zones possibles pour afficher un message : chaque formulaire a la sienne + une zone globale
export type ZoneMessage = 'livre' | 'univers' | 'personnage' | 'global' | null;

@Injectable({ providedIn: 'root' })
export class MessageService {
  message = signal('');
  zoneMessage = signal<ZoneMessage>(null);
  estErreur = computed(() => /erreur|incoh|obligatoire/i.test(this.message()));
  champsEnErreur = signal<string[]>([]);

  afficher(msg: string, zone: ZoneMessage) {
    this.message.set(msg);
    this.zoneMessage.set(zone);
  }

  reset() {
    this.champsEnErreur.set([]);
    this.message.set('');
    this.zoneMessage.set(null);
  }

  gererErreur(err: any, zone: ZoneMessage = 'global') {
    const msg = err.error?.erreur ?? 'Erreur: ' + err.message;
    this.afficher(msg, zone);
    if (/incoh/i.test(msg)) {
      this.champsEnErreur.set([
        'dateNaisJour', 'dateNaisMois', 'dateNaisAnnee',
        'dateDecesJour', 'dateDecesMois', 'dateDecesAnnee'
      ]);
    }
  }
}
