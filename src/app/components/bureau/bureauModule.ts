import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';

import {BureauDashboard} from './bureauDashboard';
import {UniNewCompanyModal} from './newCompanyModal';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule
    ],
    declarations: [
        BureauDashboard,
        UniNewCompanyModal
    ],
    entryComponents: [
        UniNewCompanyModal
    ],
    exports: [
        CommonModule
    ]
})
export class BureauModule {}
