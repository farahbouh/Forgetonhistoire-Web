import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, ZoneMessage } from '../../services/message.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  // Zone dans laquelle ce composant affiche le message (ex: <app-message zone="livre" />)
  zone = input.required<ZoneMessage>();
  messages = inject(MessageService);
}
