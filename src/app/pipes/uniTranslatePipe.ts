import {Pipe, PipeTransform} from '@angular/core';
import {UniTranslationService} from '@app/services/services';

@Pipe({name: 'translate', pure: true})
export class UniTranslatePipe implements PipeTransform {
    constructor(private translateService: UniTranslationService) {}
    public transform(stringToTranslate: string, params: any, options): string {
        return this.translateService.translate(stringToTranslate, params, options);
    }
}
