import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonnageComponent } from '../personnage/personnage.component';
import { ApiService } from '../../services/api.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-univers',
  standalone: true,
  imports: [CommonModule, PersonnageComponent],
  templateUrl: './univers.component.html',
  styleUrl: './univers.component.css'
})
export class UniversComponent {
  univers = input.required<any>();
  livre = input.required<any>();
  rafraichir = output<void>();

  private api = inject(ApiService);
  private messages = inject(MessageService);

  supprimerUnivers() {
    const nom = this.univers().nom;
    if (!confirm(`Supprimer l'univers "${nom}" ?`)) return;

    this.api.envoyer(
      'DELETE',
      `/api/univers?livreId=${this.livre().id}&id=${this.univers().id}`,
      null,
      () => {
        this.messages.afficher('Univers supprime', 'global');
        this.rafraichir.emit();
      },
      'univers'
    );
  }
}