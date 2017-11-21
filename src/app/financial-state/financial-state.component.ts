import { Component, OnInit } from '@angular/core';
import { FinancialStateService } from './financial-state.service';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-financial-state',
  templateUrl: './financial-state.component.html',
  styleUrls: ['./financial-state.component.scss']
})
export class FinancialStateComponent implements OnInit {
  public data: any;
  public actives = [];
  public pasives = [];
  public totalActives: number;
  public totalPasives: number;
  public communityId: number;
  public isLoading: Boolean = true;
  public accountViewDetail: Boolean;

  constructor(private _financialStateService: FinancialStateService,
    private _translateService: TranslateService,
    private _toasterService: ToasterService) { }

  ngOnInit() {
    // inicialización de variables
    this.communityId = +localStorage.getItem('communityId');
    this.initServices();
  }

  // inicializamos data necesaria para funcionamiento de vista
  public initServices(): void {
    const getFinantial = this._financialStateService.getFinancialState(this.communityId);
    // ejecución de observables necesarios para funcionamiento de vista
    getFinantial
      .subscribe(
      financial => {
        // recuperamos datos para el estado financiero
        this.data = financial;
        this.viewAccount(this.data);
        this.totalActives = financial.json().actives.total;
        this.totalPasives = financial.json().pasives.total;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        const DELETE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
        this._translateService.get(['GENERAL.ERROR_TITLE', DELETE_ERROR_MESSAGE])
          .subscribe((res: string) => {
            this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[DELETE_ERROR_MESSAGE]);
          });
      },
      () => {
        // desactivar loading
        this.isLoading = false;
      });
  }

  public viewAccount (data: any): void {
    this.actives = data.json().actives.childs.filter(c => c.total !== 0);
    this.actives.forEach(account => {
      const list = account.childs.filter(cs => cs.total !== 0);
      account.childs = list;
    });

    this.pasives = data.json().pasives.childs.filter(c => c.total !== 0);
    this.pasives.forEach(account => {
      const list = account.childs.filter(cs => cs.total !== 0);
      account.childs = list;
    });
  }

  public viewAccountChange() {
    if (this.accountViewDetail) {
      this.actives = this.data.json().actives.childs;
      this.pasives = this.data.json().pasives.childs;
    } else {
      this.viewAccount(this.data);
    }
  }

}
