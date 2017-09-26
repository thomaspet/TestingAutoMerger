import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ProductCategory, ProductCategoryLink} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {ITag} from '../../components/common/toolbar/tags';
import {StatisticsService} from './statisticsService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class ProductCategoryService extends BizHttp<ProductCategory> {

    public currentProductGroup: BehaviorSubject<ProductCategory> = new BehaviorSubject(null);
    public isDirty: boolean;

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);

        this.relativeURL = ProductCategory.RelativeUrl;
        this.entityType = ProductCategory.EntityType;
        this.DefaultOrderBy = null;
    }

    public setNew() {
        this.currentProductGroup.next(new ProductCategory);
    }

    public searchCategories(query: string, ignoreFilter: string): Observable<ProductCategory[]> {
        return this
            .GetAll(`filter=contains(Name,'${query}')${ignoreFilter ? ' and (' + ignoreFilter + ')' : ''}&top=50`);
    }

    public saveCategoryTag(currentID: number, category: ProductCategory): Observable<ITag>  {
        if (currentID && category) {
            super.invalidateCache();
            return this.http.asPOST()
                .usingBusinessDomain()
                .withEndPoint(ProductCategoryLink.RelativeUrl)
                .withBody({ProductID: currentID, ProductCategoryID: category.ID})
                .send()
                .map(response => response.json())
                .map(cat => {return {title: category.Name, linkID: cat.ID}});
        }
        return Observable.of(null);
    }

    private deleteCategoryLink(linkID: number) {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint(ProductCategoryLink.RelativeUrl + '/' + linkID)
            .send();
    }

    public deleteCategoryTag(currentID: number, tag: ITag) {
        return (tag && tag.linkID
            ? this.deleteCategoryLink(tag.linkID)
            : Observable.of(false));
    }

    public getProductCategories(currentID: number): Observable<ProductCategory[]> {
        return this.statisticsService.GetAllUnwrapped(`model=ProductCategory&select=Name,ProductCategoryLink.ID&join=ProductCategory.ID%20eq%20productcategorylink.ProductCategoryID&filter=ProductCategoryLink.ProductID%20eq%20${currentID}`);
    }
}
