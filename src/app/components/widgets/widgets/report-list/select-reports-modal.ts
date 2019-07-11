import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ReportDefinition} from '@uni-entities';

@Component({
    selector: 'select-reports-modal',
    // template: `
    // <section role="dialog" class="uni-modal uni-redesign">
    //     <header>Rapportsnarveier</header>

    //     <article class="scrollable">
    //         <section *ngFor="let group of reportGroups">
    //             <span>{{group.name}}</span>
    //             <mat-selection-list>
    //                 <mat-list-option *ngFor="let report of group.reports"
    //                     checkboxPosition="before"
    //                     [selected]="report._selected"
    //                     (click)="report._selected = !report._selected">

    //                     {{report.Name}}
    //                 </mat-list-option>
    //             </mat-selection-list>
    //         </section>
    //     </article>

    //     <footer class="center">
    //         <button class="c2a rounded" (click)="submit()">Bekreft</button>
    //         <button (click)="onClose.emit()">Avbryt</button>
    //     </footer>
    // </section>

    // `,
    templateUrl: './select-reports-modal.html'
    // styleUrls: ['./user-settings-modal.sass']
})
export class SelectReportsModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    reportGroups: { name: string; reports: ReportDefinition[] }[];
    selectedReports: ReportDefinition[];

    ngOnInit() {
        const data = this.options.data || {};
        this.reportGroups = data.reportGroups || [];
        const selectedReports = data.selectedReports || [];

        this.reportGroups.forEach(group => {
            group.reports = group.reports.map(report => {
                report['_selected'] = selectedReports.some(r => r.ID === report.ID);
                return report;
            });
        });
    }

    submit() {
        const selectedReports = [];
        this.reportGroups.forEach(group => {
            group.reports.forEach(report => {
                if (report['_selected']) {
                    selectedReports.push(report);
                }
            });
        });

        this.onClose.emit(selectedReports);
    }
}
