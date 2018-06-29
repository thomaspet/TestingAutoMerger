import {Injectable, Injector} from '@angular/core';
import {NavbarLinkService} from '../navbar/navbar-link-service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import * as _ from 'lodash';

@Injectable()
export class SmartSearchDataService {

    private confirmedSuperSearchRoutes = [];
    public componentLookupSource = [];
    private modelsInSearch = [];
    private shortcuts = [];
    public searchResultViewConfig = [];
    public displayFullscreenSearch: boolean = false;
    public isPrefixSearch: boolean = false;
    public prefixModule: any;
    private predifinedPrefixes = [
        'f', 'o', 't', 'a', 'l', 'p', 'k',
        'faktura',
        'ordre',
        'tilbud',
        'ansatt',
        'kunde',
        'leverandør',
        'prosjekt',
        'produkt'
    ];

    constructor(private navbarLinkService: NavbarLinkService) {
        this.navbarLinkService.linkSections$.subscribe(linkSections => {
            this.componentLookupSource = [];
            this.confirmedSuperSearchRoutes = [];
            this.shortcuts = [];
            linkSections.forEach(section => {

                section.linkGroups.forEach(group => {
                    group.links.forEach( (link) => {
                        if (link.isSuperSearchComponent) {
                            this.confirmedSuperSearchRoutes.push(link);
                        }
                        if (link.shortcutName) {
                            this.shortcuts.push(link);
                        }
                    });
                    this.componentLookupSource.push(...group.links);
                });
            });
        });
    }

    public syncLookup(query: string): any[] {
        return [].concat(this.componentLookup(query), this.getNewShortcutListInit(query));
    }

    public asyncLookup(query: string): Observable<any[]> {
        this.isPrefixSearch = this.checkPrefixForSpecificSearch(query);
        if (query.startsWith('ny') || query.startsWith('nytt') || query === '' || (query.length < 3 && !this.isPrefixSearch)) {
            return Observable.of([]);
        }

        return Observable.forkJoin(this.createQueryArray(query, this.isPrefixSearch, query.substr(0, 1)))
            .map((res) => {
                return this.generateConfigObject(res);
            });
    }

    private generateConfigObject(rawData: any) {
        const dataForViewRender = [];

        // Loop all the arrays in the raw data from server
        rawData.forEach((data, ind) => {

            // Loop all individual arrays of given component
            data.forEach((dataset, index) => {
                if (index === 0) {
                    dataForViewRender.push({
                        type: 'header',
                        url: '',
                        value: this.modelsInSearch[ind].name
                    });
                }

                let valueString = '';
                for (const key in dataset) {
                    if (valueString === '' && !key.includes('ID')) {
                        valueString += dataset[key] || 'Kladd';
                    } else if (!key.includes('ID')) {
                        valueString += ' - ' + dataset[key] || 'Kladd';
                    }
                }

                dataForViewRender.push({
                    type: 'link',
                    url: this.modelsInSearch[ind].url + '/' + dataset[Object.keys(dataset)[0]],
                    value: valueString
                });
            });
        });
        return dataForViewRender;
    }

    private checkPrefixForSpecificSearch(query: string) {
        // Check first to see if the user has added a '.' in search to indicate prefix search
        if (query.includes('.')) {
            const firstWordSearched = query.split('.')[0];
            if (this.predifinedPrefixes.indexOf(firstWordSearched) >= 0) {
                return true;
            }
        }
        return false;
    }

    private createQueryArray(query: string, withPrefix: boolean = false, prefix?: string) {
        const queries = [];
        this.modelsInSearch = [];
        let filterValue = 'startswith'; // query.length > 3 ? 'contains' : '';

        const searchRoutes = withPrefix
            ? this.confirmedSuperSearchRoutes.filter(route => route.prefix === prefix)
            : this.confirmedSuperSearchRoutes;

        if (searchRoutes.length) {
            this.prefixModule = {
                name: searchRoutes[0].name,
                url: searchRoutes[0].url
            };
        }

        // query = withPrefix ? query.substr(2, query.length - 1) : query;
        if (withPrefix) {
            const splittedQuery = query.split('.');
            splittedQuery.shift();
            query = splittedQuery.join('.');
        }

        if (query.substr(0, 1) === '*') {
            filterValue = 'contains';
            query = query.substr(1, query.length - 1);
        }

        searchRoutes.forEach((route) => {
            const filteredSelects = [route.selects[0]];

            for (let i = 1; i < route.selects.length; i++) {
                if (route.selects[i].isNumeric !== isNaN(parseInt(query, 10))) {
                    filteredSelects.push(route.selects[i]);
                }
            }

            let queryStringInit = '';

            if (filteredSelects.length > 1) {
                this.modelsInSearch.push(route);
                const selectString = route.selects.map(selKey => selKey.key).join(',');

                queryStringInit += `?model=${route.moduleName}&select=${selectString}`;

                for (let i = 1; i < filteredSelects.length; i++) {
                    queryStringInit += (i === 1 ? '&filter=' : '');
                    queryStringInit +=  `${filterValue}(${filteredSelects[i].key}, '${query}')`;
                    if (i !==  filteredSelects.length - 1) {
                        queryStringInit += ' or ';
                    }
                }

                if (route.expand) {
                    queryStringInit += '&expand=' + route.expands.join(',');
                }

                if (route.joins) {
                    queryStringInit += '&join=' + route.joins.join(',');
                }

                queryStringInit += `&top=${withPrefix ? 100 : 5}&orderby=id desc&wrap=false`;

                queries.push(this.navbarLinkService.getQuery(queryStringInit));
            }
        });

        return queries;
    }

    getNewShortcutListInit(query: string) {
        // Create array of predefined shortcuts and filter based on query
        let filteredShortCuts = _.cloneDeep(this.shortcuts);
        filteredShortCuts = filteredShortCuts.filter(res => res.shortcutName.toLowerCase().includes(query));

        filteredShortCuts.forEach(res => {
            res.url += '/0';
            res.value = res.shortcutName;
            res.type = 'link';
        });

        // If shortcuts was found, add a header for that section
        if (filteredShortCuts.length) {
            filteredShortCuts.unshift({
                type: 'header',
                url: '/',
                value: 'Kommandoer'
            });
            return filteredShortCuts;
        }
        return [];
    }

    private componentLookup(query: string) {
        if (!query) {
            return [];
        }

        const results: any = [
            {
                type: 'header',
                value: 'Gå til skjermbilde',
                url: '/',
            }
        ];

        const querySplit = query.split(' ');
        if (querySplit[0] === 'ny' || querySplit[0] === 'nytt') {
            querySplit.shift();
            query = querySplit.join(' ');
        }

        this.componentLookupSource.forEach((component) => {
            const name = component && component.name;
            if (name && name.toLowerCase().indexOf(query) !== -1) {
                component.type = 'link';
                results.push(component);
            }
        });

        return results.length > 1 ? results : [];
    }

}
