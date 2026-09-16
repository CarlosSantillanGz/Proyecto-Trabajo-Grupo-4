import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
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
