import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';
import {InputDropdownModule} from '../input-dropdown/input-dropdown';
import {Autocomplete} from './autocomplete';
import {ClickOutsideModule} from '@uni-framework/click-outside/click-outside.module';

@NgModule({
    imports: [
        LibraryImportsModule,
        InputDropdownModule,
        ClickOutsideModule,
    ],
    declarations: [Autocomplete],
    exports: [Autocomplete]
})
export class AutocompleteModule {}
