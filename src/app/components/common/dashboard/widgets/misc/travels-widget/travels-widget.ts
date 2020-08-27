import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {Travel} from '@uni-entities';
import {TravelService, ErrorService} from '@app/services/services';
import {DashboardDataService} from '../../../dashboard-data.service';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'travels-widget',
    templateUrl: './travels-widget.html',
    styleUrls: ['./travels-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelsWidget {
    loading = true;
    importBusy: boolean;

    dataSubscription: Subscription;
    scrollbar: PerfectScrollbar;
    travels: Partial<Travel>[];

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
        private travelService: TravelService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.loadTravels();
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
        this.scrollbar?.destroy();
    }

    private loadTravels() {
        const select = [
            'Name as Name',
            'Description as Description',
            'max(TravelLines.CostType) as _costType'
        ].join(',');

        const endpoint = `/api/statistics?model=Travel&select=${select}&filter=State eq 0&expand=TravelLines&wrap=false`

        this.dataSubscription = this.dataService.get(endpoint).subscribe(
            travels => {
                this.travels = (travels || []).map(travel => {
                    travel['_costTypeText'] = this.travelService.typeText(travel._costType);
                    return travel;
                });

                this.loading = false;
                this.cdr.markForCheck();

                setTimeout(() => {
                    if (this.travels?.length) {
                        if (this.scrollbar) {
                            this.scrollbar.update();
                        } else {
                            this.scrollbar = new PerfectScrollbar('#travel-list', {
                                wheelPropagation: true,
                                wheelSpeed: .5
                            });
                        }
                    }
                });
            },
            err => {
                console.error(err);
                this.loading = false;
                this.cdr.markForCheck();
            }
        );
    }

    importTravels() {
        this.importBusy = true;
        this.travelService.ttImport().pipe(
            finalize(() => {
                this.importBusy = false;
                this.cdr.markForCheck();
            })
        ).subscribe(
            () => this.loadTravels(),
            err => this.errorService.handle(err)
        );
    }
}
