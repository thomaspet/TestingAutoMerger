import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';

import {LayoutModule} from '../layout/layoutModule';
import {LicenseInfo} from './license-info';
import {CompanyList} from './company-list/company-list';
import {AdminList} from './admin-list/admin-list';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        LayoutModule,

        RouterModule.forChild([{
            path: '',
            pathMatch: 'full',
            component: LicenseInfo
        }]),
    ],
    declarations: [
        LicenseInfo,
        CompanyList,
        AdminList
    ]
})
export class LicenseInfoModule {}
