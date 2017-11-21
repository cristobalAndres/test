import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { PropertyService } from '../services/property.service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmControlComponent } from '../controls/confirm-control/confirm-control.component'
import {
  Payment,
  PaymentView,
  PaymentPositiveBalance,
  PositiveBalances,
  PaymentsUsingPositiveBalance
} from '../models/payment.model';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { Property } from '../models/property.model';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild(ConfirmControlComponent) confirmControl: ConfirmControlComponent;
  private componentDestroyed: Subject<boolean> = new Subject();
  public filterQuery = '';

  public communityId: number;
  public payments: PaymentView[] = [];
  public properties: Property[];
  public isLoading: boolean = false;

  deletePay: PaymentView;

  constructor(private router: Router,
              public _toasterService: ToasterService,
              private _translateService: TranslateService,
              private paymentService: PaymentService,
              private propertyService: PropertyService) {
  }

  ngOnInit(): void {
    this.communityId = +localStorage.getItem('communityId');
    this.getAll(this.communityId);
  }

  getProperties(): void {
    this.propertyService.all(this.communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => this.properties = data.json() as Property[]
      );
  }

  getAll(communityId: number): void {
    this.isLoading = true;
    this.paymentService.all(communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          this.payments = [];
          const payments = data.json() as Payment[]
          payments.forEach((e: Payment) => {
            e.is_mov_positive_balance = false;
            e.payments_using_positive_balances = [];
            e.positive_balances.forEach((pb: PositiveBalances) => {
              if (pb.payment_positive_balance.add_balance) {
                const positiveBalanceId = pb.payment_positive_balance.positive_balance_id;
                payments.forEach((e2) => {
                  e2.positive_balances.forEach((pb2: PositiveBalances) => {
                    if (positiveBalanceId === pb2.payment_positive_balance.positive_balance_id && !pb2.payment_positive_balance.add_balance) {
                      // agrega al payment aquellos payments que usan el positive balance generado
                      e.payments_using_positive_balances.push({id: pb2.id, folio: e2.folio});
                      e.is_mov_positive_balance = true;
                    }
                  })
                })
              }
            });
            this.payments.push(new PaymentView(e))
          })
          this.isLoading = false;
        },
        error => {
          const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
          this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
            .subscribe((res: string) => {
              this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
            });
        }
      );
  }

  onSelectProperty(property): void {
    this.router.navigate(['/property/' + property.id + '/payment/create', {advance: false}]);
  }

  downloadPDF(payment: PaymentView): void {
    this.paymentService.downloadPDF(this.communityId, payment.property_id, payment.id)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          const file = new Blob([data.blob()], {type: 'application/pdf'});
          FileSaver.saveAs(file, `${payment.property_name}-${payment.folio}.pdf`);
        }
      );
  }

  onAcceptDelete = () => {
    this.isLoading = true;
    if (this.deletePay) {
      this.paymentService.reversePay(this.communityId, this.deletePay.id)
        .takeUntil(this.componentDestroyed)
        .subscribe(
          data => {
            this.getAll(this.communityId);
            this._translateService.get(['GENERAL.SUCCESS_TITLE', 'PAYMENT.DELETE.SUCCESS'])
              .subscribe((res: string) => {
                this._toasterService.pop('success', res['GENERAL.SUCCESS_TITLE'], res['PAYMENT.DELETE.SUCCESS']);
              });
            this.isLoading = false;
          },
          error => {
            const RESPONSE_ERROR_MESSAGE = 'GENERAL.NOTIFICATION.UNKNOWN_ERROR';
            this._translateService.get(['GENERAL.ERROR_TITLE', RESPONSE_ERROR_MESSAGE])
              .subscribe((res: string) => {
                this._toasterService.pop('error', res['GENERAL.ERROR_TITLE'], res[RESPONSE_ERROR_MESSAGE]);
              });
            this.isLoading = false;
          }
        );
    }
  };

  openModalConfirmDelete(pay: PaymentView) {
    this.deletePay = pay;
    this._translateService.get([
      'GENERAL.CONFIRMATION_TITLE',
      'PAYMENT.DELETE.CONFIRM_DELETE',
      'GENERAL.DELETE',
      'GENERAL.CLOSE'
    ], pay).subscribe((traslation) => {
      const options = {
        title: traslation['GENERAL.CONFIRMATION_TITLE'],
        text: traslation['PAYMENT.DELETE.CONFIRM_DELETE'],
        style: 'modal-danger',
        buttons: {
          ok: {
            text: traslation['GENERAL.DELETE'],
            icon: 'fa fa-times',
            style: 'btn btn-danger'
          },
          cancel: {
            text: traslation['GENERAL.CLOSE'],
            icon: ''
          }
        },
        onAccept: this.onAcceptDelete,
        // onCancel: this.cancelImport
      };
      this.confirmControl.openModal(options);
    })
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
