import { NgModule } from '@angular/core';
import { AMeldingViewComponent } from './a-melding-view.component';
import { AmeldingAgaViewComponent } from './aga-view/a-melding-aga-view.component';
import { AmeldingPeriodSummaryViewComponent } from './period-summary-view/period-summary-view.component';
import { AmeldingReceiptViewComponent } from './a-melding-receipt/receipt-view.component';
import { AmeldingSummaryViewComponent } from './a-melding-summary/summary.component';
import { AMeldingTypePickerModalComponent } from './modals/a-melding-type-picker-modal.component';
import { AMeldingPeriodSplitViewComponent } from './modals/period-admin-modal/tabViews/a-melding-period-split-view/a-melding-period-split-view.component';
import { AMeldingPayrollsPeriodViewComponent } from './modals/period-admin-modal/tabViews/a-melding-payrolls-period-view/a-melding-payrolls-period-view.component';
import { StatusAMeldingModalComponent } from './modals/status-a-melding-modal/status-a-melding-modal.component';
import { MakeAmeldingPaymentModalComponent } from './modals/make-a-melding-payment-modal/make-a-melding-payment-modal.component';
import { AltinnErrorHandlerService } from './shared/service/altinn-error-handler.service';
import { AMeldingService } from './shared/service/a-melding.service';
import { SalarySharedModule } from '../shared/salary-shared.module';
import { PeriodAdminModalComponent } from './modals/period-admin-modal/period-admin-modal.component';
import { ReconciliationModalComponent } from './reconciliation-modal/reconciliation-modal.component';
import { AltinnReceiptListComponent } from './altinn-receipt-list/altinn-receipt-list.component';
import { ReconciliationRequestComponent } from './reconciliation-request/reconciliation-request.component';
import { ReconciliationResponseModalComponent } from './reconciliation-response-modal/reconciliation-response-modal.component';
import { AMeldingRoutingModule } from './a-melding-routing.module';
import { PensionSchemeService } from './shared/service/pension-scheme.service';
import { PensionSchemeModalComponent } from './modals/pension-scheme-modal/pension-scheme-modal.component';
import { CustomPensionSchemeModalComponent } from './modals/custom-pension-scheme-modal/custom-pension-scheme-modal.component';
import { PensionSchemeSupplierService } from './shared/service/pension-scheme-supplier.service';
import { CustomPensionSchemeService } from './shared/service/custom-pension-scheme.service';

@NgModule({
    imports: [
        SalarySharedModule,
        AMeldingRoutingModule
    ],
    declarations: [
        AMeldingViewComponent,
        AmeldingAgaViewComponent,
        AmeldingPeriodSummaryViewComponent,
        AmeldingReceiptViewComponent,
        AmeldingSummaryViewComponent,
        AMeldingTypePickerModalComponent,
        AMeldingPeriodSplitViewComponent,
        AMeldingPayrollsPeriodViewComponent,
        StatusAMeldingModalComponent,
        MakeAmeldingPaymentModalComponent,
        PeriodAdminModalComponent,
        ReconciliationModalComponent,
        AltinnReceiptListComponent,
        ReconciliationRequestComponent,
        ReconciliationResponseModalComponent,
        PensionSchemeModalComponent,
        CustomPensionSchemeModalComponent,
    ],
    providers: [
        AltinnErrorHandlerService,
        AMeldingService,
        PensionSchemeService,
        PensionSchemeSupplierService,
        CustomPensionSchemeService,
    ]
  })
  export class AMeldingModule { }
