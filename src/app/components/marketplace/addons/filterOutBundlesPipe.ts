import {PipeTransform, Pipe} from '@angular/core';
import {ElsaProduct} from '@app/services/services';
@Pipe({
    name: 'filterOutBundles'
})
export class FilterOutBundlesPipe implements PipeTransform {
    public transform(items: Array<ElsaProduct>): Array<ElsaProduct> {
        return items.filter(item => item.isBundle === false && item.label !== 'Festbillett');
    }
}
