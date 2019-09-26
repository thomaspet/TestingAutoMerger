import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import PerfectScrollbar from 'perfect-scrollbar';
import {WidgetDataService} from '../widgetDataService';

@Component({
    selector: 'uni-reminder-list',
    template: `
        <section class="widget-wrapper">
            <section class="header sr-widget-header">
                <span> {{ widget.description }} </span>
            </section>
            <div class="content reminder-list-widget">
                <ul id="reminder-list" [ngClass]="!items.length && dataLoaded ? 'empty-list' : ''">
                    <li *ngFor="let item of items">
                        <i class="material-icons"> {{ item.icon }} </i>
                        <div>
                            <span (click)="navigateOnClick(item.link)" title="Gå til liste">{{ item.Title }} </span>
                            <span> {{ item.ml }}  </span>
                        </div>
                    </li>
                </ul>
                <span class="no-items-message">
                    <i class="material-icons"> mood </i>
                    Huskelist tom, godt jobbet
                </span>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReminderListWidget {
    widget: IUniWidget;
    items: Array<any> = [];
    scrollbar: PerfectScrollbar;
    dataLoaded: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService
    ) {}

    public ngAfterViewInit() {
        this.widgetDataService.getData('/api/statistics?model=Task&select=ID as ID,Title as Title,ModelID as ModelID,Model.Label as ml,' +
        `StatusCode as StatusCode,Type as Type,UserID as UserID&filter=UserID eq ${this.authService.currentUser.ID} and ` +
        `StatusCode ne 50030&top=50&expand=model&orderby=ID desc`)
        .subscribe((data) => {
            if (data && data.Data) {
                this.items = data.Data.map(item => {
                    item.icon = this.getIcon(item);
                    return item;
                });

                if (this.widget && this.items && this.items.length) {
                    this.scrollbar = new PerfectScrollbar('#reminder-list', {wheelPropagation: true});
                }
            }
            this.dataLoaded = true;
            this.cdr.markForCheck();
        }, err => {
            this.dataLoaded = true;
            this.cdr.markForCheck();
        });
    }

    getIcon(item) {
        if (!item.ml) {
            return 'schedule';
        } else {
            return 'local_atm';
        }
    }

    ngOnDestroy() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
    }

    public navigateOnClick(url: string) {
        this.router.navigateByUrl(url);
    }
}
