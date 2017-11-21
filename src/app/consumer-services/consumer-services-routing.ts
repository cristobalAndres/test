import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ConsumerServicesComponent } from './consumer-services.component';
import { DistributionConsumptionComponent } from './distribution-consumption/distribution-consumption.component';
import { ConsumptionServicesComponent } from './consumption-services/consumption-services.component';
import { AssignExpensesToDistributionComponent } from './assign-expenses-to-distribution/assign-expenses-to-distribution.component';
import { RecordReadingComponent } from './record-reading/record-reading.component'

const routes: Routes = [
  {
    path: '',
    component: ConsumerServicesComponent,
    data: {
      title: 'CONSUMER_SERVICES.GENERAL.PLURAL'
    },
    children: [
      {
        path: 'distribution',
        component: DistributionConsumptionComponent,
        data: {
          title: 'CONSUMER_SERVICES.DISTRIBUTION_CONSUMPTION.PLURAL'
        }
      }, {
        path: 'consumption-services',
        component: ConsumptionServicesComponent,
        data: {
          title: ''
        }
      }, {
        path: 'assign-expenses',
        component: AssignExpensesToDistributionComponent,
        data: {
          title: ''
        }
      },
      {
        path: 'record-reading',
        component: RecordReadingComponent,
        data: {
          title: ''
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsumerServicesRoutingModule {
}
