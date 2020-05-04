import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';

import {LayoutModule} from '../layout/layoutModule';

import {LicenseInfo} from './license-info';
import {LicenseDetails} from './details/details';
import {CompanyList} from './company-list/company-list';
import {Billing} from './billing/billing';
import {TransactionsPerCompany} from './billing/transactions-per-company/transactions-per-company';
import {CostPerUser} from './billing/cost-per-user/cost-per-user';
import {InvoiceItemDetails} from './billing/invoice-item-details/invoice-item-details';

import {CellValuePipe, ListView} from './list-view/list-view';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {UserList} from './user-list/license-user-list';
import {UserDetails} from './user-list/license-user-details/license-user-details';
import {AddAdminModal} from './add-admin-modal/add-admin-modal';
import {DeletedCompaniesModal} from './company-list/deleted-companies-modal/deleted-companies-modal';
import {DeleteCompanyModal} from './company-list/delete-company-modal/delete-company-modal';
import {AppCommonModule} from '../common/appCommonModule';

@NgModule({
    imports: [
        LibraryImportsModule,
        LayoutModule,
        AppCommonModule,
        UniFrameworkModule,

        RouterModule.forChild([{
            path: '',
            component: LicenseInfo,
            children: [
                { path: '', pathMatch: 'full', redirectTo: 'details' },
                { path: 'details', component: LicenseDetails },
                { path: 'companies', component: CompanyList },
                { path: 'users', component: UserList },
                { path: 'billing', component: Billing },
            ]
        }]),
    ],
    declarations: [
        LicenseInfo,
        LicenseDetails,
        CompanyList,
        UserList,
        UserDetails,
        Billing,
        TransactionsPerCompany,
        CostPerUser,
        InvoiceItemDetails,
        CellValuePipe,
        ListView,
        AddAdminModal,
        DeletedCompaniesModal,
        DeleteCompanyModal
    ]
})
export class LicenseInfoModule {}
