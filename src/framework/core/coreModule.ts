import {NgModule} from '@angular/core';
import {UniComponentLoader} from './componentLoader';
import {ClickOutsideDirective} from './clickOutside';
import {UniHttp} from './http/http';
import {ComponentCreator} from './dynamic/UniComponentCreator';

@NgModule({
    declarations: [
        UniComponentLoader,
        ClickOutsideDirective
    ],
    providers: [
        UniHttp,
        ComponentCreator
    ],
    exports: [
        UniComponentLoader,
        ClickOutsideDirective
    ]
})
export class UniCoreModule {
    
}
