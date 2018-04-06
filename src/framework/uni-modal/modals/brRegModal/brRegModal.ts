import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {CompanySettings, Address, Phone} from '@app/unientities';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {BusinessRelationService, ErrorService} from '@app/services/services';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

export interface IBrRegCompanyInfo {
    navn: string;
    orgnr: string;
    forretningsadr: string;
    forradrpostnr: string;
    forradrpoststed: string;
    forradrland: string;
    postadresse: string;
    ppostnr: string;
    ppoststed: string;
    ppostland: string;
    tlf_mobil: string;
    tlf: string;
    url: string;
    forradrkommnavn: string;
    forradrkommnr: string;
    organisasjonsform: string;
}

@Component({
    selector: 'uni-brreg-modal',
    templateUrl: './brRegModal.html',
    styleUrls: ['./brRegModal.sass']
})
export class UniBrRegModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<IBrRegCompanyInfo> = new EventEmitter();

    public searchControl: FormControl = new FormControl('');
    public searchResults: IBrRegCompanyInfo[] = [];
    public selectedIndex: number;

    constructor(
        private brService: BusinessRelationService,
        private errorService: ErrorService,
    ) {
        this.searchControl.valueChanges
            .debounceTime(300)
            .subscribe(query => {
                if (query && query.length > 2) {
                    this.performLookup(query);
                }
            });
    }

    private performLookup(query: string) {
        this.selectedIndex = undefined;
        this.brService.search(query).subscribe(
            res => {
                if (res && res.Data) {
                    this.searchResults = res.Data.entries || [];
                } else {
                    this.searchResults = [];
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public selectItem(index: number) {
        this.selectedIndex = index;
    }

    public close(emitValue?: boolean) {
        const selectedItem = this.searchResults && this.searchResults[this.selectedIndex];
        if (emitValue && selectedItem) {
            this.onClose.emit(selectedItem);
        } else {
            this.onClose.emit();
        }
    }
}
