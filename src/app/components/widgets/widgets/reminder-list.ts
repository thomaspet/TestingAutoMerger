import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import PerfectScrollbar from 'perfect-scrollbar';
import {WidgetDataService} from '../widgetDataService';
import {NewTaskModal} from '../../common/new-task-list/new-task-list';
import {UniModalService} from '@uni-framework/uni-modal';
import { Task } from '@uni-entities';

@Component({
    selector: 'uni-reminder-list',
    template: `
        <section class="widget-wrapper">
            <section class="header sr-widget-header">
                <span style="flex: 1"> {{ widget.description }} </span>
                <i class="material-icons" (click)="newTask()" title="Opprett ny oppgave" style="cursor: pointer;"> add </i>
            </section>
            <div class="content reminder-list-widget">
                <ul id="reminder-list" [ngClass]="!items.length && dataLoaded ? 'empty-list' : ''">
                    <li *ngFor="let item of items" (click)="goToTaskView(item)" title="Gå til liste">
                        <i class="material-icons"> {{ item.icon }} </i>
                        <div>
                            <span>{{ item.Title }} </span>
                            <span> {{ item.Name }}  </span>
                        </div>
                    </li>
                </ul>
                <span class="no-items-message">
                    <i class="material-icons"> mood </i>
                    Huskelisten er tom, godt jobbet
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
        private widgetDataService: WidgetDataService,
        private modalService: UniModalService
    ) {}

    public ngAfterViewInit() {
        this.getDataAndLoadList();
    }

    getDataAndLoadList() {
        this.widgetDataService.clearCache();
        this.widgetDataService.getData('/api/statistics?model=Task&select=ID as ID,Title as Title,ModelID as ModelID,Model.Name as Name,' +
            `StatusCode as StatusCode,Type as Type,UserID as UserID&filter=UserID eq ${this.authService.currentUser.ID} and ` +
            `StatusCode ne 50030 and Type ne 1&top=50&expand=model&orderby=ID desc`)
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
        if (!item.Name) {
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

    newTask() {
        this.modalService.open(NewTaskModal).onClose.subscribe((taskWasAdded: boolean) => {
            if (taskWasAdded) {
                this.getDataAndLoadList();
            }
        });
    }

    public goToTaskView(item: Task) {
        this.router.navigateByUrl(`/assignments/tasks`);
    }
}
