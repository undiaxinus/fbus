import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondManagementComponent } from './bond-management.component';

describe('BondManagementComponent', () => {
  let component: BondManagementComponent;
  let fixture: ComponentFixture<BondManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BondManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
