import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import {ErrorService, WorkerService} from '@app/services/services';
import {WorkItem, WorkType, LocalDate} from '@app/unientities';
import {IUniModal} from '@uni-framework/uni-modal/interfaces';
import * as moment from 'moment';

@Component({
    selector: 'timetracking-import-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>Import av timer fra fil</header>

            <article>
                <label class="upload-input">
                    <i class="material-icons">cloud_upload</i>
                    <span>Last opp fil</span>

                    <input #fileInput (change)="fileAdded()" type="file" accept=".csv,.txt" />
                </label>

                <span *ngIf="fileChecked" class="timeentry-import-validation">
                    <ng-template [ngIf]="workItems?.length">
                        <i class="material-icons good">check_circle</i>
                        Filen inneholder {{workItems.length}} linjer
                    </ng-template>

                    <ng-template [ngIf]="!workItems?.length">
                        <i class="material-icons bad">error</i>
                        Fant ingen gyldige linjer i filen
                    </ng-template>
                </span>

                <label class="worktype-select" *ngIf="workTypes">
                    Standard timeart (dersom timeart mangler)
                    <select [(ngModel)]="defaultTypeName">
                        <option [value]="type.Name" *ngFor="let type of workTypes">
                            {{type.Name}}
                        </option>
                    </select>
                </label>
            </article>

            <footer>
                <button class="good" (click)="close(true)" [disabled]="!fileChecked">
                    Importer
                </button>

                <button (click)="close(false)" class="bad">Avbryt</button>
            </footer>
        </section>
    `,
})
export class TimeentryImportModal implements IUniModal {
    @ViewChild('fileInput') private fileInput: any;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    private fileSummary: { count: number };
    public workItems: WorkItem[] = [];
    public workTypes: WorkType[] = [];
    public defaultTypeName: string = '';

    public fileChecked: boolean;

    constructor(workerService: WorkerService, errorService: ErrorService) {
        workerService.get('worktypes?hateoas=false&select=id,name&orderby=name')
            .subscribe((workTypes: WorkType[]) => this.workTypes = workTypes);
    }

    public fileAdded() {
        this.getWorkItemsFromFile()
            .catch(err => {
                console.error(err);
                this.fileChecked = true;
            })
            .then((items: WorkItem[]) => {
                this.workItems = items;
                this.fileChecked = true;
            });
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            // Get items again in case user changed standard worktype after import
            this.getWorkItemsFromFile().then((workItems) => {
                this.onClose.emit(workItems);
            });
        } else {
            this.onClose.emit([]);
        }
    }

    private getWorkItemsFromFile(): Promise<WorkItem[]> {
        return new Promise((resolve, reject) => {
            const input = this.fileInput.nativeElement;
            if (input && input.files && input.files.length) {
                const file: any = input.files[0];
                const reader = new FileReader();


                reader.onload = () => {
                    const rows = (<string> reader.result).split('\n');
                    const items = [];
                    const map = {
                        Date: 0,
                        StartTime: 0,
                        EndTime: 0,
                        WorkType: 0,
                        Minutes: 0,
                        LunchInMinutes: 0,
                        Description: 0,
                        Project: 0
                    };

                    rows.forEach( (row, rowIndex) => {
                        if (!row) { return; }
                        const item: WorkItem = <any>{};
                        const cols = this.trimApostrophes(row, true).split(';');
                        if (rowIndex === 0) {
                            cols.forEach( (col, colIndex) => {
                                const colHeader = this.trimApostrophes(col);
                                if (map[colHeader] !== undefined) {
                                    map[colHeader] = colIndex;
                                }
                            });
                            return;
                        }
                        item.Date = (map.Date ? moment(cols[map.Date]).toDate() : item.Date);
                        item.StartTime = map.StartTime ? this.parseTime(cols[map.StartTime], item.Date) : item.StartTime;
                        item.EndTime = map.EndTime ? this.parseTime(cols[map.EndTime], item.Date) : item.EndTime;
                        if (map.WorkType && this.workTypes) {
                            const nameLookup = cols[map.WorkType].toLocaleLowerCase();
                            item.Worktype = this.workTypes.find( x => x.Name.toLocaleLowerCase().indexOf( nameLookup ) === 0);
                            item.Worktype = item.Worktype || <any>{ Name: this.defaultTypeName };
                        }

                        item.Minutes = map.Minutes ? parseInt(cols[map.Minutes], 10) : item.Minutes;
                        item.LunchInMinutes = map.LunchInMinutes ? parseInt(cols[map.LunchInMinutes], 10)
                            : item.LunchInMinutes;
                        item.Description = map.Description ? cols[map.Description] : item.Description;

                        if (item.Minutes && !isNaN(item.Minutes)) {
                            item.Date = <any>(new LocalDate(item.Date));
                            items.push(item);
                        }
                    });

                    resolve(items);
                };

                reader.readAsText(<any> file);
            }
        });
    }

    private parseTime(value: string, useDate?: Date): Date {
        if (!value) { return useDate; }
        const date = useDate ? new Date(useDate.getTime()) : new Date();
        const parts = value.split(':');
        if (parts.length === 2) {
            date.setHours(parseInt(parts[0], 10));
            date.setMinutes(parseInt(parts[1], 10));
            date.setSeconds(0);
        }
        return date;
    }

    private trimApostrophes(value: string, all: boolean = false): string {
        if (all) {
            const tmp = this.trimApostrophes(value);
            return tmp.replace(new RegExp('"', 'g'), '');
        }
        if (value.indexOf('"') === 0) {
            return value.substr(1, value.length - 2);
        }
        return value;
    }
}
