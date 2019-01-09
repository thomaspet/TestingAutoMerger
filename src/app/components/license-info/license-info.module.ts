import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {LicenseInfo} from './license-info';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,

        RouterModule.forChild([{
            path: '',
            pathMatch: 'full',
            component: LicenseInfo
        }]),
    ],
    declarations: [LicenseInfo]
})
export class LicenseInfoModule {}
