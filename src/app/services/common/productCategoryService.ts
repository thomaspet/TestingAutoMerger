import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ProductCategory} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class ProductCategoryService extends BizHttp<ProductCategory> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = ProductCategory.RelativeUrl;
        this.entityType = ProductCategory.EntityType;
        this.DefaultOrderBy = null;
    }
}
