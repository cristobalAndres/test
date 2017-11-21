import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { PropertyService } from '../../services/property.service';
import { Payment } from '../../models/payment.model';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { Property } from '../../models/property.model';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-payment',
  templateUrl: './payment-advance.component.html',
  styleUrls: ['./payment-advance.component.scss']
})
export class PaymentAdvanceComponent implements OnInit, OnDestroy {

  private componentDestroyed: Subject<boolean> = new Subject();
  public filterQuery = '';

  public communityId: number;
  public payments: Payment[] = [];
  public properties: Property[];
  public isLoading: boolean = false;

  constructor(private router: Router,
              private paymentService: PaymentService,
              private propertyService: PropertyService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.communityId = +localStorage.getItem('communityId');
    this.getAll(this.communityId);
    this.isLoading = false;
  }

  getProperties(): void {
    this.propertyService.all(this.communityId, true)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => this.properties = data.json() as Property[]
      );
  }

  getAll(communityId: number): void {
    this.paymentService.advances(communityId)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => this.payments = data.json() as Payment[]
      );
  }

  onSelectProperty(property): void {
    console.log(property);
    this.router.navigate(['/property/' + property.id + '/payment/create', {advance: true}]);
  }

  downloadPDF(payment: Payment): void {
    this.paymentService.downloadPDF(this.communityId, payment.property.id, payment.id)
      .takeUntil(this.componentDestroyed)
      .subscribe(
        data => {
          console.log(data);
          const file = new Blob([data.blob()], {type: 'application/pdf'});
          FileSaver.saveAs(file, `${payment.property.name}-${payment.folio}.pdf`);
        }
      );
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }
}
