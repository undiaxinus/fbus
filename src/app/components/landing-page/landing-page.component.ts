import { Component, ViewEncapsulation, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  encapsulation: ViewEncapsulation.None
})
export class LandingPageComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  scrollToSolutions() {
    if (isPlatformBrowser(this.platformId)) {
      const solutionsSection = document.getElementById('solutions-section');
      if (solutionsSection) {
        solutionsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
