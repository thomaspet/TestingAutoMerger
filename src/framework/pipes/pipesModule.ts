import {NgModule} from '@angular/core';
import {FilterInactivePipe} from './filterInactivePipe';
import {OrderByPipe} from './orderByPipe';


@NgModule({
    declarations: [
        FilterInactivePipe,
        OrderByPipe
    ],
    exports: [
        FilterInactivePipe,
        OrderByPipe
    ]

})
export class UniPipesModule {

}

