import {Component, Input, Output, SimpleChange, EventEmitter} from '@angular/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {BusinessRelationService, ErrorService} from '../../../services/services';

@Component({
    selector: 'external-search',
    templateUrl: './externalSearch.html'
})
export class ExternalSearch {
    @Input() private searchText: any;
    @Input() private useInternalSearchBox: boolean;
    @Input() public helpText: string;
    @Output() private selectEvent: EventEmitter<SearchResultItem> = new EventEmitter<SearchResultItem>();

    private lastClickedName: string;
    private showAllResults: boolean;

    private MINIMUMHITS: number = 6;

    private searchResult: any[];
    private fullSearchResult: any[];

    constructor(
        private http: UniHttp,
        private businessRelationService: BusinessRelationService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {
        if (!this.useInternalSearchBox) {
            this.useInternalSearchBox = false;
        }

        this.showAllResults = false;
        this.searchResult = [];
        this.fullSearchResult = [];
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (changes['searchText'] !== null && this.lastClickedName !== this.searchText && this.searchText !== '') {
            this.businessRelationService
                    .search(this.searchText)
                    .subscribe(
                        (result) => {
                            if (result !== null && result.Data !== null) {
                                this.fullSearchResult = result.Data.entries;

                                if (this.showAllResults) {
                                    this.searchResult = this.fullSearchResult;
                                } else {
                                    // default display only first 6 searchresults
                                    this.searchResult = this.fullSearchResult.slice(0, this.MINIMUMHITS);
                                }
                            } else {
                                this.searchResult = [];
                                this.fullSearchResult = [];
                            }
                        },
                        err => this.errorService.handle(err)
                    );
        }
    }

    public doShowAllResults() {
        this.searchResult = this.fullSearchResult;
        this.showAllResults = true;
        return false;
    }

    public doHideAllResults() {
        this.searchResult = this.fullSearchResult.slice(0, this.MINIMUMHITS);
        this.showAllResults = false;
        return false;
    }

    public selectItem(item: any) {
        this.lastClickedName = item.navn;

        this.selectEvent.emit(item);
        return false;
    }
}

export class SearchResultItem {
    public navn: string;
    public orgnr: string;
    public forretningsadr: string;
    public forradrpostnr: string;
    public forradrpoststed: string;
    public forradrland: string;
    public postadresse: string;
    public ppostnr: string;
    public ppoststed: string;
    public ppostland: string;
    public tlf_mobil: string; //tslint:disable-line
    public tlf: string;
    public url: string;
    public forradrkommnavn: string;
    public forradrkommnr: string;
    public organisasjonsform: string;
}
