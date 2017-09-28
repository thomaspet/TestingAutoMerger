import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UniFrameworkModule} from '../../../framework/frameworkModule';

import {BureauDashboard} from './bureauDashboard';

@NgModule({
    imports: [
        CommonModule,
        UniFrameworkModule,
        ReactiveFormsModule
    ],
    declarations: [
        BureauDashboard
    ],
    exports: [
        CommonModule
    ]
})
export class BureauModule {}
