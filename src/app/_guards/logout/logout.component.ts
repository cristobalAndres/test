import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-logout',
  template: '<div></div>'
})
export class LogoutComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  loading: boolean = false;
  returnUrl: string = '/login';

  constructor(private router: Router,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser');
    this.authenticationService.logout(currentUser);
    localStorage.removeItem('currentUser');
    this.router.navigate([this.returnUrl]);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
