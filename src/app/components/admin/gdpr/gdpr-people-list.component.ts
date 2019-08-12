import { Component } from '@angular/core';
import { IUniTableConfig } from '@uni-framework/ui/unitable';
import { HttpParams } from '@angular/common/http';
import { PeopleService } from '@app/components/admin/gdpr/people.service';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { tableConfig } from './table.config';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { BrowserStorageService } from '@uni-framework/core/browserStorageService';
@Component({
    selector: 'uni-gdpr-people-list',
    templateUrl: 'uni-gdpr-people-list.html',
})
export class UniGdprPeopleList {
    public tableConfig: IUniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => Observable<any>;
    public searchControl: FormControl;
    public data: Array<any> = [];
    public STORAGE_KEY = 'gdpr_filter';
    public busy = false;

    constructor(
        private peopleService: PeopleService,
        private router: Router,
        private tabService: TabService,
        private storage: BrowserStorageService
    ) {
        this.tableConfig = tableConfig;
        this.tabService.addTab({
            url: '/admin/gdpr',
            name: 'Personopplysninger',
            active: true,
            moduleID: UniModules.GDPRList
        });
        this.searchControl = new FormControl(this.storage.getSessionItemFromCompany(this.STORAGE_KEY) || '');
    }

    ngOnInit() {
        setTimeout(() => this.data = []);
        this.searchControl.valueChanges
            .debounceTime(500)
            .subscribe(searchString => {
                if (searchString === '') {
                    this.busy = false;
                    this.data = [];
                    this.storage.setSessionItemOnCompany(this.STORAGE_KEY, searchString);
                    return;
                }
                const filter = this.getFilter(searchString);
                this.storage.setSessionItemOnCompany(this.STORAGE_KEY, searchString);
                const params = new HttpParams().set('filter', filter);

                this.busy = true;

                this.peopleService.getPeople(params, searchString).subscribe(
                    data => {
                        this.busy = false;
                        this.data = data;
                    },
                    () => this.busy = false
                );
            });
    }

    onRowSelected(row) {
        switch (row._Source) {
            case 'Customer':
                this.router.navigateByUrl('/sales/customer/' + row.ID);
                break;
            case 'Supplier':
                this.router.navigateByUrl('/accounting/suppliers/' + row.ID).then(result => console.log(result));
                break;
            case 'Contact':
                this.router.navigateByUrl('/contacts/' + row.ID).then(result => console.log(result));
                break;
            case 'Worker':
                this.router.navigateByUrl('/timetracking/workers/' + row.ID);
                break;
            case 'Employee':
                this.router.navigateByUrl('/salary/employees/' + row.ID);
                break;
        }
    }

    getFilter(searchString: string): string {
        return [
            `contains(Info.DefaultEmail.EmailAddress, '${searchString}')`,
            `contains(Info.DefaultPhone.Number, '${searchString}')`,
            `contains(Info.Name, '${searchString}')`
        ].join(' or ');
    }

    get hasMoreThan50() {
        return this.peopleService.oneHasMoreThan50;
    }

    get showNoDataMessage() {
        return this.data.length === 0 && this.searchControl.value !== '';
    }
}



// WEBPACK FOOTER //
// c:/Jenkins/workspace/Feature build and deploy frontend playground Arild/src/app/components/admin/gdpr/gdpr-people-list.component.ts