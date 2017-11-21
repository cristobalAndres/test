import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ResetPassword } from '../../models/login.model';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  model: ResetPassword = new ResetPassword;
  loading: boolean = false;
  returnUrl: string;
  hasErrors: boolean = false;
  wasSend: boolean = false;

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    localStorage.removeItem('currentUser');
    this.returnUrl = '/login';
  }

  recover(): void {
    this.loading = true;
    this.hasErrors = false;
    this.wasSend = false;
    this.authenticationService.reset(this.model.email)
    // .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          console.log(data);
          this.wasSend = true;
        },
        () => {
          this.loading = false;
          this.hasErrors = true;
        }
      );
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
