import { Component, input } from '@angular/core';
import { PersonnageComponent } from '../personnage/personnage.component';

@Component({
  selector: 'app-univers',
  standalone: true,
  imports: [PersonnageComponent],
  templateUrl: './univers.component.html',
  styleUrl: './univers.component.css'
})
export class UniversComponent {
  univers = input.required<any>();
}