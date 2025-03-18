import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondLookupComponent } from './bond-lookup.component';

describe('BondLookupComponent', () => {
  let component: BondLookupComponent;
  let fixture: ComponentFixture<BondLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondLookupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BondLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
