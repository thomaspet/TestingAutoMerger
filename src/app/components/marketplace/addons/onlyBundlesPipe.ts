import {PipeTransform, Pipe} from '@angular/core';
import {ElsaProduct} from '@app/services/services';
@Pipe({
    name: 'onlyBundles'
})
export class OnlyBundlesPipe implements PipeTransform {
    public transform(items: Array<ElsaProduct>): Array<ElsaProduct> {
        return items.filter(item => item.isBundle === true);
    }
}
