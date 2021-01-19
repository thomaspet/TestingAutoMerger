import {Injectable} from '@angular/core';
import {NavbarLinkService} from '../navbar/navbar-link-service';
import {Observable} from 'rxjs';
import {cloneDeep} from 'lodash';

import {UniModalService, ConfirmActions, UniPreviewModal} from '@uni-framework/uni-modal';
import {UniReportParamsModal} from '../../reports/modals/parameter/reportParamModal';
import {UserSettingsModal} from '../navbar/user-dropdown/user-settings-modal';
import {AuthService} from '@app/authService';
import {UniTranslationService} from '@app/services/common/translationService';

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
        'f', 'o', 't', 'a', 'l', 'p', 'k', 'r',
        'faktura',
        'ordre',
        'tilbud',
        'ansatt',
        'kunde',
        'leverandør',
        'prosjekt',
        'produkt',
        'rapport',
        'regning'
    ];

    private helpAndUserItems = [
        {
            type: 'external-link',
            url: 'https://help.unieconomy.no',
            value: 'Kundesenter'
        },
        {
            type: 'external-link',
            url: 'https://unimicro.atlassian.net/servicedesk/customer/portal/3/create/24',
            value: 'Opprett supportsak'
        },
        {
            type: 'external-link',
            url: 'https://unimicro.atlassian.net/servicedesk/customer/user/requests?status=open',
            value: 'Mine supportsaker'
        },
        {
            type: 'external-link',
            url: 'ftp://ftp.unimicro.biz/teknisk/umtt.exe',
            value: 'Teamviewer nedlasting'
        },
        { type: 'link', url: '/about/versions', value: 'Versjonsinformasjon' },
        { type: 'link', url: '/license-info', value: 'Lisensinformasjon' },
        { type: 'user', url: '', value: 'Brukerinnstillinger' }
    ];

    constructor(
        private navbarLinkService: NavbarLinkService,
        private uniModalService: UniModalService,
        private translate: UniTranslationService,
        private authService: AuthService
    ) {
        this.navbarLinkService.linkSections$.subscribe(linkSections => {
            const settings = this.navbarLinkService.settingsSection$.getValue();
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

                        link['_section'] = section.name;
                    });
                    this.componentLookupSource.push(...group.links);
                });
            });

            settings.forEach((setting) => {
                setting.linkGroups.forEach(group => {
                    this.componentLookupSource.push(...group.links);

                    group.links.forEach(link => {
                        if (link.subSettings) {
                            this.componentLookupSource.push(...link.subSettings);
                        }
                    });
                });
            });
        });
    }

    public syncLookup(query: string): any[] {
        if (query.startsWith('ny') || query.startsWith('nytt')) {
            return [].concat(this.getNewShortcutListInit(query), this.getHelpAndUserItems(query), this.componentLookup(query));
        } else {
            return [].concat(this.componentLookup(query), this.getHelpAndUserItems(query), this.getNewShortcutListInit(query));
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
                if (this.modelsInSearch[ind].name === 'NAVBAR.REPORTS') {
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
                    queryStringInit += (i === 1 ? '&filter=( ' : '');
                    queryStringInit +=  `${filterValue}(${filteredSelects[i].key}, '${query}')`;
                    if (i !==  filteredSelects.length - 1) {
                        queryStringInit += ' or ';
                    }
                }
                queryStringInit += ' )';

                if (route.predefinedFilter) {
                    queryStringInit += queryStringInit !== '' ? ' and ' + route.predefinedFilter : route.predefinedFilter;
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
        let filteredShortCuts = cloneDeep(this.shortcuts);
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

    getHelpAndUserItems(query: string) {
        const all = cloneDeep(this.helpAndUserItems);
        if (query.toLowerCase() === 'hjelp') {
             all.unshift({
                type: 'header',
                url: '/',
                value: 'Hjelp'
            });
            return all;
        }

        const items = all.filter(item => item.value.toLowerCase().includes(query));
        if (items.length) {
            items.unshift({
                type: 'header',
                url: '/',
                value: 'Hjelp'
            });
            return items;
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

    public openUserSettingsModal() {
        this.uniModalService.open(UserSettingsModal, { data: this.authService.currentUser });
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

        let hasSettings = false;

        const querySplit = query.split(' ');
        if (querySplit[0] === 'ny' || querySplit[0] === 'nytt') {
            querySplit.shift();
            query = querySplit.join(' ');
        }

        this.componentLookupSource.forEach((component) => {
            const name = component && component.name;

            if (name && this.translate.translate(name).toLowerCase().indexOf(query) !== -1
                || this.translate.translate(component._section).toLowerCase().indexOf(query) !== -1
                || (component.keyWords && component.keyWords.filter(word => word.toLowerCase().includes(query)).length)) {
                component.type = 'link';
                if (component.url.includes('settings') && 'innstillinger'.includes(query)) {
                    hasSettings = true;
                }

                results.push(component);
            }
        });

        // Add the settings overview link to results
        if (hasSettings) {
            results.splice(1, 0, {
                name: 'Innstillinger',
                url: '/settings',
                type: 'link'
            });
        }

        return results.length > 1 ? results : [];
    }

}
