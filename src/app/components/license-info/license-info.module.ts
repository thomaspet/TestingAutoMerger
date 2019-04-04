import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';

import {AppPipesModule} from '@app/pipes/appPipesModule';
import {LayoutModule} from '../layout/layoutModule';

import {LicenseInfo} from './license-info';
import {LicenseDetails} from './details/details';
import {CompanyList} from './company-list/company-list';
import {Billing} from './billing/billing';
import {InvoiceItemDetails} from './billing/invoice-item-details/invoice-item-details';

import {CellValuePipe, ListView} from './list-view/list-view';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';
import {UserList} from './user-list/user-list';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        LayoutModule,
        AppPipesModule,
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
        Billing,
        InvoiceItemDetails,
        CellValuePipe,
        ListView
    ]
})
export class LicenseInfoModule {}
