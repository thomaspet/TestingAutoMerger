import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {SupplierInvoiceView} from './supplier-invoice';
import {SupplierInvoiceExpense} from './supplier-invoice-expense';
import {DetailsFormExpense} from './components/details-form-expense/details-form-expense';
import {AppCommonModule} from '@app/components/common/appCommonModule';
import {DetailsForm} from './components/details-form/details-form';
import {JournalLines} from './components/journal-lines/journal-lines';
import {Attachments} from './components/supplier-invoice-attachments/supplier-invoice-attachments';
import {SupplierInvoiceStore} from './supplier-invoice-store';
import {OCRHelperClass} from './ocr-helper';
import {SmartBookingHelperClass} from './smart-booking-helper';
import {JournalAndPaymentHelper} from './journal-and-pay-helper';
import {ToPaymentModal} from './modals/to-payment-modal/to-payment-modal';

@NgModule({
    imports: [
        CommonModule,
        LibraryImportsModule,
        UniFrameworkModule,
        AppCommonModule,
    ],
    providers: [
        SupplierInvoiceStore,
        OCRHelperClass,
        SmartBookingHelperClass,
        JournalAndPaymentHelper
    ],
    declarations: [
        SupplierInvoiceView,
        SupplierInvoiceExpense,
        DetailsForm,
        DetailsFormExpense,
        JournalLines,
        Attachments,
        ToPaymentModal
    ]
})
export class SupplierInvoiceModule {}
