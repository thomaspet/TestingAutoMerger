import {PipeTransform, Pipe} from '@angular/core';
import {AdminProduct} from '../../../services/admin/adminProductService';
@Pipe({
    name: 'onlyBundles'
})
export class OnlyBundlesPipe implements PipeTransform {
    public transform(items: Array<AdminProduct>): Array<AdminProduct> {
        return items.filter(item => item.isBundle === true);
    }
}
