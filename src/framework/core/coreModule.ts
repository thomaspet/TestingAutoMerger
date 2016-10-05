import {NgModule} from '@angular/core';
import {UniComponentLoader} from './componentLoader';
import {ClickOutsideDirective} from './clickOutside';
import {AuthService} from './authService';
import {UniHttp} from './http/http';
import {ComponentCreator} from './dynamic/UniComponentCreator';

@NgModule({
    declarations: [
        UniComponentLoader,
        ClickOutsideDirective
    ],
    providers: [
        UniHttp,
        AuthService,
        ComponentCreator
    ],
    exports: [
        UniComponentLoader,
        ClickOutsideDirective
    ]
})
export class UniCoreModule {
    
}
