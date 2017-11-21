import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionService } from './transaction.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit, OnDestroy {

  communityId: number;
  private subscription: Subscription = new Subscription();
  transactions: any[];
  isLoading = true;
  filterQuery = '';

  constructor(private transactionService: TransactionService) {
  }

  ngOnInit() {
    this.communityId = +localStorage.getItem('communityId');
    this.subscription.add(
      this.transactionService.getAll(this.communityId)
        .subscribe(data => {
          this.transactions = data.json();
          this.isLoading = false;
          console.log(this.transactions);
        }, err => console.log(err))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
