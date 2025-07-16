import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArquitecturaComponent } from './arquitectura.component';

describe('ArquitecturaComponent', () => {
  let component: ArquitecturaComponent;
  let fixture: ComponentFixture<ArquitecturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArquitecturaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArquitecturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
