import {JournalEntries} from './journalentries/journalentries';
import {Payments} from './payments/payments';
import {SupplierInvoiceList} from './supplierinvoices/supplierinvoicelist';
import {SupplierInvoiceDetail} from './supplierinvoices/supplierinvoicedetail';
import {BillsView} from './../bill/bills';

export const routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'manual'
    },
    {
        path: 'manual',
        component: JournalEntries
    },
    {
        path: 'payments',
        component: Payments
    },
    {
        path: 'supplierinvoices',
        component: SupplierInvoiceList
    },
    {
        path: 'supplierinvoices/:id',
        component: SupplierInvoiceDetail
    },
    {
        path: 'bills',
        component: BillsView
    },    
];
