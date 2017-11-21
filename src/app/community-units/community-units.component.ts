import { Component, OnInit } from '@angular/core';


import 'rxjs/add/operator/takeUntil';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-community-units',
  templateUrl: './community-units.component.html',
  styleUrls:  ['./community-units.component.scss']
})
export class CommunityUnitsComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {}
}
