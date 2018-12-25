import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationsComponent } from './designations.component';

describe('DesignationsComponent', () => {
  let component: DesignationsComponent;
  let fixture: ComponentFixture<DesignationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
