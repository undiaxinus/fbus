import { Component, ViewEncapsulation, AfterViewInit, inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('solutionsSection') solutionsSection!: ElementRef;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  scrollToSolutions() {
    if (isPlatformBrowser(this.platformId)) {
      const solutionsElement = this.solutionsSection?.nativeElement;
      if (solutionsElement) {
        const offset = 80; // Offset to account for any fixed headers
        const elementPosition = solutionsElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
}
