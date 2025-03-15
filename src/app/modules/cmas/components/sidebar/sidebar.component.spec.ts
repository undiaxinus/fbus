import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name and role', () => {
    component.userName = 'Test User';
    component.currentRole = 'duty_pnco';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-sm.font-semibold')?.textContent).toContain('Test User');
    expect(compiled.querySelector('.text-xs.text-gray-400')?.textContent).toContain('Duty Pnco');
  });

  it('should show correct navigation items for duty_pnco role', () => {
    component.currentRole = 'duty_pnco';
    fixture.detectChanges();
    
    const navItems = component.currentNavItems;
    expect(navItems.length).toBe(4);
    expect(navItems[0].title).toBe('Dashboard');
    expect(navItems[1].title).toBe('Duty Roster');
    expect(navItems[2].title).toBe('Reports');
    expect(navItems[3].title).toBe('Notifications');
  });

  it('should show correct navigation items for cmas_admin role', () => {
    component.currentRole = 'cmas_admin';
    fixture.detectChanges();
    
    const navItems = component.currentNavItems;
    expect(navItems.length).toBe(4);
    expect(navItems[0].title).toBe('Dashboard');
    expect(navItems[1].title).toBe('User Management');
    expect(navItems[2].title).toBe('Settings');
    expect(navItems[3].title).toBe('Audit Logs');
  });

  it('should return empty array for invalid role', () => {
    component.currentRole = 'invalid_role';
    fixture.detectChanges();
    
    const navItems = component.currentNavItems;
    expect(navItems.length).toBe(0);
  });
}); 