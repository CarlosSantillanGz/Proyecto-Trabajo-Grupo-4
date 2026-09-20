import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero {
  protected scrollToSection(sectionId: string, event: MouseEvent): void {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
