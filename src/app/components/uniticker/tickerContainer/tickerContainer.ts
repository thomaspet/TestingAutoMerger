import {Component, ViewChild, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Ticker, TickerGroup, TickerAction, TickerFilter, TickerColumn} from '../../../services/common/uniTickerService';
import {UniTicker} from '../ticker/ticker';
import {UniSubTickerContainer} from '../subTickerContainer/subTickerContainer';
import {UniTickerFilters} from '../components/tickerFilters';
import {UniTickerService, PageStateService} from '../../../services/services';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-container',
    templateUrl: './tickerContainer.html'
})
export class UniTickerContainer {
    @Input() private ticker: Ticker;
    @Input() private showActions: boolean;
    @Input() private showFilters: boolean;
    @Input() private showSubTickers: boolean = false;
    @Output() private urlPropertiesChanged: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniTicker) private uniTicker: UniTicker;
    @ViewChild(UniSubTickerContainer) private uniSubTickerContainer: UniSubTickerContainer;
    @ViewChild(UniTickerFilters) private uniTickerFilters: UniTickerFilters;

    private expanded: string = 'ticker';
    public selectedFilter: TickerFilter;

    private selectedRow: any;

    constructor(private pageStateService: PageStateService) {
    }

    public ngOnInit() {

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['ticker']) {
            let pageState = this.pageStateService.getPageState();

            if (pageState.filter && pageState.filter !== '' && this.ticker && this.ticker.Filters) {
                this.selectedFilter = this.ticker.Filters.find(x => x.Code === pageState.filter);
            } else {
                this.selectedFilter = null;
            }

            // set expand based on what was expanded - but dont expand subticker, because
            // that requires that the data are loaded first - this will be handled
            // automatically when setting the selected row in the next section of this function
            if (pageState.expanded && pageState.expanded !== '' && pageState.expanded !== 'subticker') {
                this.setExpanded(pageState.expanded);
            } else {
                this.setExpanded('ticker');
            }

            // we need the data to be loaded before setting this, so let the data be loaded
            // and set the selected row / expand afterwards if needed
            /*
            KE: AVVENT DENNE - MULIG DET LØSER SEG SELV MED NY STICKY ROUTER
            if (pageState.selected) {
                setTimeout(() => {
                    if (pageState.selected && pageState.selected !== '') {
                        this.uniTicker.setSelectedRow(pageState.selected);

                    } else {
                        this.selectedRow = null;
                    }
                });
            }*/


        }
    }

    private setExpanded(newExpand: string, doToggleToTicker: boolean = false) {

        if (newExpand === this.expanded && doToggleToTicker) {
            this.expanded = 'ticker';
        } else {
            if (newExpand === 'subticker' && !this.selectedRow) {
                alert('Velg en rad i tabellen for å se detaljer');
            } else {
                this.expanded = newExpand;
            }
        }

        this.pageStateService.setPageState('expanded', this.expanded);
        this.urlPropertiesChanged.emit();
    }

    private onRowSelected(selectedRow: any) {
        this.selectedRow = selectedRow;

        if (selectedRow && selectedRow._originalIndex) {
            this.pageStateService.setPageState('selected', selectedRow._originalIndex);
            this.urlPropertiesChanged.emit();
        }

        if (this.ticker.SubTickers && this.ticker.SubTickers.length > 0 && this.selectedRow) {
            this.setExpanded('subticker');
        }
    }

    private onFilterSelected(filter: TickerFilter) {
        if (filter !== this.selectedFilter) {

            this.selectedFilter = filter;
            this.selectedRow = null;

            this.setExpanded('ticker');

            this.pageStateService.setPageState('selected', null);
            this.pageStateService.setPageState('filter', filter.Code);

            this.urlPropertiesChanged.emit();
        }
    }

    private onFilterChanged(filter: TickerFilter) {
        this.selectedFilter = _.cloneDeep(filter);
        this.selectedRow = null;

        // if filter.Filter is changed, this means the user has activly clicked a
        // button - so close the filterbox and expand the tickerview instead
        if (filter && filter.Filter && filter.Filter.length > 0) {
            this.setExpanded('ticker');
        }

        this.pageStateService.setPageState('selected', null);
        this.pageStateService.setPageState('filter', filter ? filter.Code : null);

        this.urlPropertiesChanged.emit();
    }

    public exportToExcel(completeEvent) {
        this.uniTicker.exportToExcel(completeEvent);
    }
}
