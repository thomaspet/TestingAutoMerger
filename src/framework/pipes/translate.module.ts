import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UniTranslatePipe} from './uniTranslatePipe';

@NgModule({
    imports: [CommonModule],
    declarations: [UniTranslatePipe],
    exports: [UniTranslatePipe]

})

export class UniTranslatePipesModule { }
