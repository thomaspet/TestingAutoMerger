import {Injectable, Injector} from '@angular/core';
import {NavbarLinkService} from '../navbar/navbar-link-service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import * as _ from 'lodash';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {UniReportParamsModal} from '../../reports/modals/parameter/reportParamModal';
import {UniPreviewModal} from '../../reports/modals/preview/previewModal';
import {AuthService} from '@app/authService';

@Injectable()
export class SmartSearchDataService {

    private confirmedSuperSearchRoutes = [];
    public componentLookupSource = [];
    private modelsInSearch = [];
    private shortcuts = [];
    public searchResultViewConfig = [];
    public displayFullscreenSearch: boolean = false;
    public isPrefixSearch: boolean = false;
    public isNewTOFWithCustomerSearch: boolean = false;
    public newTOFWithCustomerURL;
    public prefixModule: any;
    private predefinedPrefixes = [
        'f', 'o', 't', 'a', 'l', 'p', 'k',
        'faktura',
        'ordre',
        'tilbud',
        'ansatt',
        'kunde',
        'leverandør',
        'prosjekt',
        'produkt',
        'rapport'
    ];

    constructor(
        private navbarLinkService: NavbarLinkService,
        private uniModalService: UniModalService,
        private authService: AuthService
    ) {
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
        if (query.startsWith('ny') || query.startsWith('nytt')) {
            return [].concat(this.getNewShortcutListInit(query), this.componentLookup(query));
        } else {
            return [].concat(this.componentLookup(query), this.getNewShortcutListInit(query));
        }
    }

    public asyncLookup(query: string): Observable<any[]> {
        const prefix = this.getPrefix(query);

        this.isPrefixSearch = !!prefix;
        this.isNewTOFWithCustomerSearch = this.checkPrefixForTOFWithNewCustomer(query);
        if ((query.startsWith('ny') || query.startsWith('nytt') || query === '' || (query.length < 3 && !this.isPrefixSearch))
            && !this.isNewTOFWithCustomerSearch ) {
            return Observable.of([]);
        }

        return Observable.forkJoin(
            // Use the isNewTOFWithCustomerSearch boolean to set prefix
            this.createQueryArray(
                query,
                (this.isPrefixSearch || this.isNewTOFWithCustomerSearch),
                this.isNewTOFWithCustomerSearch ? 'kunde' :  query.split('.')[0]))
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
                let type = 'link';
                if (index === 0) {
                    dataForViewRender.push({
                        type: 'header',
                        url: '',
                        value: this.modelsInSearch[ind].name
                    });
                }

                let valueString = '';
                const actionValues = [];
                for (const key in dataset) {
                    if (valueString === '' && !key.includes('ID')) {
                        actionValues.push(dataset[key]);
                        valueString += dataset[key] || 'Kladd';
                    } else if (!key.includes('ID')) {
                        actionValues.push(dataset[key]);
                        valueString += ' - ' + dataset[key] || 'Kladd';
                    } else {
                        actionValues.push(dataset[key]);
                    }
                }

                // This can be expanded to fit more actions.. For now we are adding the reports
                // and opening them where you are when clicked!
                if (this.modelsInSearch[ind].name === 'Rapporter') {
                    type = 'report';
                }

                // If the user wants to create new tof but searching for customers, set url to match given tof with customer ID attached..
                // Also check if module is project, because the project url build up is different.. The other views might change ?
                const url = this.isNewTOFWithCustomerSearch
                    ? this.newTOFWithCustomerURL + '/0;customerID=' + dataset[Object.keys(dataset)[0]]
                    : this.modelsInSearch[ind].url + ((this.modelsInSearch[ind].moduleName === 'Project') ? '?projectID=' : '/')
                    + dataset[Object.keys(dataset)[0]];

                dataForViewRender.push({
                    type: type,
                    url: url,
                    value: valueString,
                    actionValues: actionValues
                });
            });
        });
        return dataForViewRender;
    }

    private getPrefix(query: string) {
        if (query.includes('.')) {
            const prefix = query.split('.')[0];
            if (this.predefinedPrefixes.includes(prefix)) {
                return prefix;
            }
        }

        return;
    }

    private checkPrefixForTOFWithNewCustomer(query) {
        return (query.startsWith('ny faktura ') || query.startsWith('ny ordre ') || query.startsWith('nytt tilbud '));
    }

    private createQueryArray(query: string, withPrefix: boolean = false, prefix?: string) {
        const queries = [];
        this.modelsInSearch = [];
        let filterValue = 'startswith';

        const searchRoutes = withPrefix
            ? this.confirmedSuperSearchRoutes.filter(route =>  route.prefix && !!route.prefix.filter(
                (pre) => pre.toLowerCase() === prefix.toLowerCase()).length )
            : this.confirmedSuperSearchRoutes;

        if (searchRoutes.length) {
            this.prefixModule = {
                name: searchRoutes[0].name,
                url: searchRoutes[0].url
            };
        }

        if (withPrefix && !this.isNewTOFWithCustomerSearch) {
            const splittedQuery = query.split('.');
            splittedQuery.shift();
            query = splittedQuery.join('.');
        }

        // IF the query starts with 'ny tilbud | ordre | faktura' set URL to given TOF and search for customers..
        if (this.isNewTOFWithCustomerSearch) {
            const splittedQuery = query.split(' ');
            this.newTOFWithCustomerURL = this.confirmedSuperSearchRoutes.filter(route =>  route.prefix && !!route.prefix.filter(
                (pre) => pre.toLowerCase() === splittedQuery[1].toLowerCase()).length )[0].url;
            splittedQuery.splice(0, 2);
            query = splittedQuery.join(' ');
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

                if (route.expands) {
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

    public openReportModal(report) {
        this.uniModalService.open(UniReportParamsModal,
            {   data: report,
                header: report.Name,
                message: report.Description
            }).onClose.subscribe(modalResult => {
                if (modalResult === ConfirmActions.ACCEPT) {
                    this.uniModalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            });
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
