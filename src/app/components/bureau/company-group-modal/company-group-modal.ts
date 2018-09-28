import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {KpiCompany} from '../kpiCompanyModel';
import * as _ from 'lodash';
import PerfectScrollbar from 'perfect-scrollbar';

export interface ICompanyGroup {
    name: string;
    companyKeys?: string[];
    active?: boolean;
    static?: boolean;
}

@Component({
    selector: 'company-group-modal',
    templateUrl: './company-group-modal.html',
    styleUrls: ['./company-group-modal.sass']
})
export class CompanyGroupModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<ICompanyGroup[]> = new EventEmitter();

    searchControl: FormControl = new FormControl('');
    companies: KpiCompany[];
    filteredCompanies: KpiCompany[];

    groups: ICompanyGroup[]= [];
    editingIndex: number = 0;

    listScroll: PerfectScrollbar;
    detailsScroll: PerfectScrollbar;

    ngOnInit() {
        const data = this.options.data || {};
        this.companies = data.companies || [];

        this.searchControl.valueChanges
            .debounceTime(200)
            .subscribe(value => this.filterCompanies(value));

        this.groups = _.cloneDeep(data.groups) || [];
    }

    ngAfterViewInit() {
        this.listScroll = new PerfectScrollbar('#group-list');
        this.detailsScroll = new PerfectScrollbar('#group-details');
    }

    editGroup(index: number) {
        this.editingIndex = index;
        const group = this.groups[index];
        if (group && group.companyKeys) {
            this.companies = this.companies.map(company => {
                company['_isInGroup'] = group.companyKeys.some(key => key === company.Key);
                return company;
            });

            this.filterCompanies(this.searchControl.value);
        }

        this.detailsScroll.update();
    }

    createGroup() {
        this.groups.push({
            name: '',
            companyKeys: []
        });

        this.editGroup(this.groups.length - 1);
        this.listScroll.update();
    }

    deleteGroup(index: number) {
        if (this.editingIndex >= index) {
            this.editGroup(this.editingIndex - 1);
        }

        this.groups.splice(index, 1);
        this.listScroll.update();
    }

    companySelectionChange(company) {
        company['_isInGroup'] = !company['_isInGroup'];

        this.groups[this.editingIndex].companyKeys = this.companies.reduce((keys, c) => {
            if (c['_isInGroup']) {
                keys.push(c.Key);
            }

            return keys;
        }, []);
    }

    private filterCompanies(value: string) {
        if (value && this.companies) {
            this.filteredCompanies = this.companies.filter(c => {
                return c.ClientNumber === +value || c.Name.toLowerCase().includes(value);
            });
        } else {
            this.filteredCompanies = this.companies || [];
        }
    }

    submitChanges() {
        const groupsWithName = this.groups.filter(group => group.name);
        this.onClose.emit(groupsWithName);
    }
}
