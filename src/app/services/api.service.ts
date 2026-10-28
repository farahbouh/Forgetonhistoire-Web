import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService, ZoneMessage } from './message.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);
  private messages = inject(MessageService);

  get<T = any>(chemin: string, onSuccess: (data: T) => void) {
    this.http.get<T>(`${this.apiUrl}${chemin}`).subscribe({
      next: onSuccess,
      error: (err) => this.messages.gererErreur(err, 'global')
    });
  }

  envoyer(
    methode: 'POST' | 'PUT',
    chemin: string,
    payload: any,
    onSuccess: () => void,
    zone: ZoneMessage = 'global'
  ) {
    const url = `${this.apiUrl}${chemin}`;
    const requete = methode === 'PUT'
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    requete.subscribe({
      next: onSuccess,
      error: (err) => this.messages.gererErreur(err, zone)
    });
  }
}
