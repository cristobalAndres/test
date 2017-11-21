import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { Login } from '../../models/login.model';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  model: Login = new Login;
  loading: boolean = false;
  returnUrl: string;
  hasErrors: boolean = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    localStorage.removeItem('currentUser');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login(): void {
    this.loading = true;
    this.hasErrors = false;
    this.authenticationService.login(this.model.email, this.model.password)
      // .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          localStorage.setItem('currentUser', JSON.stringify(data.json()));
          this.router.navigate([this.returnUrl]);
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
