import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ResetPassword } from '../../models/login.model';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: [ './restore.component.scss' ]
})
export class RestoreComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  model: ResetPassword = new ResetPassword;
  loading: boolean = false;
  returnUrl: string;
  hasErrors: boolean = false;
  wasSend: boolean = false;
  token: string;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    localStorage.removeItem('currentUser');
    this.returnUrl = '/login';
    this.token = this.activatedRoute.snapshot.queryParams['token'];
  }

  recover(): void {
    this.loading = true;
    this.hasErrors = false;
    this.wasSend = false;
    this.authenticationService.restore(this.model.email, this.model.password, this.token)
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
