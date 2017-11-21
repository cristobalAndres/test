import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple',
  template: '<router-outlet></router-outlet>',
})
export class BlankLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }
}
