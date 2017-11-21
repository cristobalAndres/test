import { Component, OnInit } from '@angular/core';


import 'rxjs/add/operator/takeUntil';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {}
}
