import {Injectable} from '@angular/core';
import {UniEntity, Product} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StatisticsService} from '../statisticsService';
import {ErrorService} from '../errorService';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {ProductService} from '../../common/productService';

const MAX_RESULTS = 50;

class CustomStatisticsResultItem {
    /* tslint:disable */
    public ID: number;
    public Name: string;
    public PartName: string;
}

@Injectable()
export class UniSearchProductConfig {

    constructor(
        private statisticsService: StatisticsService,
        private productService: ProductService,
        private errorService: ErrorService,
    ) {}

    public generateProductsConfig(
        all: boolean = false,
        expands: string[] = [],
        newItemModalFn?: () => Observable<UniEntity>
    ): IUniSearchConfig {
        return {
            lookupFn: searchTerm => this.statisticsService
                .GetAllUnwrapped(this.generateProductStatisticsQuery(searchTerm, all))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            onSelect: (selectedItem: CustomStatisticsResultItem) => {
                if(selectedItem.ID) {
                    return this.productService.Get(selectedItem.ID);
                }
                return this.productService.Post(selectedItem);
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Produkt delnavn', 'Produkt navn'],
            rowTemplateFn: item => [
                item.PartName,
                item.Name
            ],
            inputTemplateFn: item =>
                `${item.PartName} - ${item.Name}`,
            newItemModalFn: newItemModalFn,
            maxResultsLength: MAX_RESULTS
        };
    }

    public generateProductStatisticsQuery(searchTerm: string, all: boolean = false): string {
      const model = 'Product';
      const isEmptySearch = !searchTerm;
      const filter = `startswith(Product.PartName,'${searchTerm}') or startswith(Product.Name,'${searchTerm}')`
      const select = [
          'Product.ID as ID',
          'Product.PartName as PartName',
          'Product.Name as Name',
      ].join(',');
      const orderBy = 'PartName';
      const skip = 0;
      const top = MAX_RESULTS;
      return `model=${model}`
          + `&filter=${filter}`
          + `&select=${select}`
          + `&orderby=${orderBy}`
          + `&skip=${skip}`
          + `&top=${top}`;
    }
}
