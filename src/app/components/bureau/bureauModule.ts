import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';

import {BureauDashboard} from './bureauDashboard';
import {UniNewCompanyModal} from './newCompanyModal';
import {BureauDetails} from './detailView/bureauDetails';
import {BureauCustomHttpService} from './bureauCustomHttpService';
import {BureauAccountingTab} from './detailView/bureauAccountingTab';
import {ValueLoader} from './valueLoader';
import {BureauSalesTab} from './detailView/bureauSalesTab';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule
    ],
    declarations: [
        BureauDashboard,
        BureauDetails,
        BureauAccountingTab,
        BureauSalesTab,
        ValueLoader,
        UniNewCompanyModal
    ],
    providers: [
        BureauCustomHttpService
    ],
    entryComponents: [
        UniNewCompanyModal
    ]
})
export class BureauModule {}
