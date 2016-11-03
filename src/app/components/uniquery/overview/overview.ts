import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniQueryDefinition} from '../../../unientities';
import {UniQueryDefinitionService} from '../../../services/services';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';

class UniQueryCategory {
    public name: string;
    public queries: Array<UniQueryDefinition>;
}

@Component({
    selector: 'uni-query-overview',
    templateUrl: 'app/components/uniquery/overview/overview.html'
})
export class UniQueryOverview {

    public queryCategories: Array<UniQueryCategory>;

    constructor(private tabService: TabService, private uniQueryDefinitionService: UniQueryDefinitionService, private router: Router) {
        this.tabService.addTab({ name: 'Uttrekkoversikt', url: '/uniqueries/overview', moduleID: UniModules.UniQuery, active: true });
    }

    private newQuery() {
        this.router.navigateByUrl('/uniqueries/details/0');
    }

    public ngOnInit() {
        this.uniQueryDefinitionService.GetAll<UniQueryDefinition>(null).subscribe((uniQueries: Array<UniQueryDefinition>) => {
            this.queryCategories = new Array<UniQueryCategory>();

            for (const uniQuery of uniQueries) {
                let queryCategory: UniQueryCategory = this.queryCategories.find(category => category.name === uniQuery.MainModelName);

                if (typeof queryCategory === 'undefined') {
                    queryCategory = new UniQueryCategory();

                    queryCategory.name = uniQuery.MainModelName;
                    queryCategory.queries = new Array<UniQueryDefinition>();
        
                    this.queryCategories.push(queryCategory);
                }
                queryCategory.queries.push(uniQuery);
            }
        });
    }
}
