import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniQueryDefinition} from '../../../unientities';
import {UniQueryDefinitionService} from '../../../services/services';
import {Router} from '@angular/router';

class UniQueryCategory {
    public name: string;
    public queries: Array<UniQueryDefinition>;
}

@Component({
    selector: 'uni-query-overview',
    templateUrl: './overview.html'
})
export class UniQueryOverview {

    public queryCategories: Array<UniQueryCategory>;

    public toolbarActions = [{
        label: 'Nytt uttrekk',
        action: this.newQuery.bind(this),
        main: true,
        disabled: false
    }];

    constructor(private tabService: TabService, private uniQueryDefinitionService: UniQueryDefinitionService, private router: Router) {
        this.tabService.addTab({ name: 'Uttrekkoversikt', url: '/uniqueries/overview', moduleID: UniModules.UniQuery, active: true });
    }

    public newQuery() {
        this.router.navigateByUrl('/uniqueries/details/0');
    }

    public ngOnInit() {
        this.uniQueryDefinitionService.GetAll(null).subscribe((uniQueries: Array<UniQueryDefinition>) => {
            this.queryCategories = new Array<UniQueryCategory>();

            for (const uniQuery of uniQueries) {
                const categoryName = uniQuery.Category || uniQuery.MainModelName;

                let queryCategory: UniQueryCategory = this.queryCategories.find(category => category.name === categoryName);

                if (typeof queryCategory === 'undefined') {
                    queryCategory = new UniQueryCategory();

                    queryCategory.name = categoryName;
                    queryCategory.queries = new Array<UniQueryDefinition>();

                    this.queryCategories.push(queryCategory);
                }
                queryCategory.queries.push(uniQuery);
            }
        });
    }
}
