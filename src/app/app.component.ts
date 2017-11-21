import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { GoogleAnalyticsEventsService } from './google-analytics-events.service';

declare let ga: Function;

@Component({
  selector: 'body',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public router: Router, public googleAnalyticsEventsService: GoogleAnalyticsEventsService) {

    const communityId = localStorage.getItem('communityId');
    if (!communityId) {
      localStorage.setItem('communityId', '2');
    }
    console.log(localStorage.getItem('communityId'));

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }

  /*
   submitEvent() {
   this.googleAnalyticsEventsService.emitEvent('testCategory', 'testAction', 'testLabel', 10);
   }
   */
}
