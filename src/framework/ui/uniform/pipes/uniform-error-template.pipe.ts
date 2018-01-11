import { Pipe, PipeTransform } from '@angular/core';
import { UniFormError } from '@uni-framework/ui/uniform';
import * as _ from 'lodash';

@Pipe({
    name: 'uniformErrorTemplate',
    pure: false
})
export class UniformErrorTemplatePipe implements PipeTransform {
    public transform(error: UniFormError): string {
        return _.template(error.errorMessage)(error);
    }
}
