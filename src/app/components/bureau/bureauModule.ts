import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {LayoutModule} from '../layout/layoutModule';
import {BureauDashboard} from './bureauDashboard';
import {BureauCustomHttpService} from './bureauCustomHttpService';
import {BureauCurrentCompanyService} from './bureauCurrentCompanyService';
import {CompanyGroupModal} from './company-group-modal/company-group-modal';
import {BureauDetails} from './detailView/bureauDetails';
import {BureauAccountingTab} from './detailView/bureauAccountingTab';
import {BureauSalaryTab} from './detailView/bureauSalaryTab';
import {BureauSalesTab} from './detailView/bureauSalesTab';
import {BureauHoursTab} from './detailView/bureauHoursTab';
import {BureauCompanyTab} from './detailView/bureauCompanyTab';
import {BureauTaskTab} from './detailView/bureauTasksTab';

const routes = [{
    path: '',
    component: BureauDashboard,
    children: [
        {
            path: '',
            pathMatch: 'full',
            redirectTo: 'tasks',
        },
        {
            path: 'tasks',
            component: BureauTaskTab,
        },
        {
            path: 'company',
            component: BureauCompanyTab,
        },
        {
            path: 'accounting',
            component: BureauAccountingTab,
        },
        {
            path: 'sales',
            component: BureauSalesTab,
        },
        {
            path: 'salary',
            component: BureauSalaryTab,
        },
        {
            path: 'hours',
            component: BureauHoursTab,
        },
    ]
}];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        LibraryImportsModule,
        UniFrameworkModule,
        AppCommonModule,
        LayoutModule,
    ],
    declarations: [
        BureauDashboard,
        BureauDetails,
        CompanyGroupModal,
        BureauTaskTab,
        BureauCompanyTab,
        BureauAccountingTab,
        BureauSalaryTab,
        BureauSalesTab,
        BureauHoursTab,
    ],
    providers: [
        BureauCustomHttpService,
        BureauCurrentCompanyService,
    ]
})
export class BureauModule {}
