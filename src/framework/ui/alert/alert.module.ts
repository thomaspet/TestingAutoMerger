import {NgModule} from '@angular/core';
import {UniAlertComponent} from '@uni-framework/ui/alert/alert.component';
import {LibraryImportsModule} from '@app/library-imports.module';

@NgModule({
    imports: [
        LibraryImportsModule
    ],
    declarations: [
        UniAlertComponent
    ],
    exports: [
        UniAlertComponent
    ]
})
export class UniAlertModule {}
