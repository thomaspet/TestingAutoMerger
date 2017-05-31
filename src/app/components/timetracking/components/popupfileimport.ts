import {Component, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, ViewChild} from '@angular/core';
import {ErrorService, WorkerService} from '../../../services/services';
import {WorkItem, WorkType, LocalDate} from '../../../unientities';
import * as moment from 'moment';

// tslint:disable:max-line-length

interface IFile {
    type: string;
}

@Component({
    selector: 'uni-file-import',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="onCancel()" class="closeBtn"></button>
                <article class="modal-content" >
                    <h3>Import av timer fra fil</h3>
                    <div>
                        Velg fil:
                        <input type="file" #fileInput accept=".csv,.txt">                        
                    </div>                                                                
                    <div *ngIf="workTypes">
                        <table><tr><td>Standard timeart (dersom timeart mangler): </td><td>
                            <select [(ngModel)]="defaultTypeName">
                                <option [value]="type.Name" *ngFor="let type of workTypes">{{type.Name}}</option>
                            </select>
                        </td></tr></table>
                    </div>
                    <p *ngIf="summary" class="good">Filen inneholder {{summary?.count}} rader</p>                    
                    <button class="dialog" (click)="preview()">Sjekk fil</button>
                    <footer>                         
                        <button (click)="onSave()" class="good dialog">Velg</button>
                        <button (click)="onCancel()" class="bad dialog">Avbryt</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush    
})
export class UniFileImport {

    @ViewChild('fileInput') private fileInput: any;
    private isOpen: boolean = false;
    private summary: { count: number };
    private workItems: Array<WorkItem> = [];
    private workTypes: Array<WorkType> = [];
    private defaultTypeName: string = '';

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService,
        private workerService: WorkerService) {
            this.fetchWorkTypes();
    }    

    private fetchWorkTypes() {
        this.workerService.get('worktypes?hateoas=false&select=id,name&orderby=name')
                .subscribe((x: Array<any>) => this.workTypes = x );
    }

    public getWorkItems(): Array<WorkItem> {
        return this.workItems;
    }

    private onSave() {
        this.loadFileIntoItems().then( x => {
            this.isOpen = false;
            this.refresh();
            this.onClose(true);
        });
    }

    private onCancel() {
        this.isOpen = false;
        this.refresh();
        this.onClose(false);
    }

    public preview() {
        this.loadFileIntoItems().then( x => {
            this.summary = {
                count: x.length
            };
            this.refresh();
        });
    }

    private loadFileIntoItems(): Promise<Array<WorkItem>> {
        this.workItems = [];
        return new Promise( (resolve, reject) => {
            let ip: any = this.fileInput.nativeElement;
            if (ip && ip.files && ip.files.length > 0) {
                let f: IFile = <IFile>ip.files[0];
                let reader = new FileReader();
                reader.onload = () => {                
                    let rows = reader.result.split('\n');
                    let items = [];
                    let map = { Date: 0, StartTime: 0, EndTime: 0, WorkType: 0, Minutes: 0, LunchInMinutes: 0, 
                        Description: 0, Project: 0  };

                    rows.forEach( (row, rowIndex) => {                    
                        if (!row) { return; }
                        let item: WorkItem = <any>{};
                        let cols = this.trimApostrophes(row, true).split(';');
                        if (rowIndex === 0) {
                            cols.forEach( (col, colIndex) => {
                                let colHeader = this.trimApostrophes(col);
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
                            let nameLookup = cols[map.WorkType].toLocaleLowerCase();
                            item.Worktype = this.workTypes.find( x => x.Name.toLocaleLowerCase().indexOf( nameLookup ) === 0);
                            item.Worktype = item.Worktype || <any>{ Name: this.defaultTypeName };
                        }
                        // item.Worktype = map.WorkType ? <any>{ Name: cols[map.WorkType] } : item.Worktype;
                        item.Minutes = map.Minutes ? parseInt(cols[map.Minutes]) : item.Minutes;
                        item.LunchInMinutes = map.LunchInMinutes ? parseInt(cols[map.LunchInMinutes]) 
                            : item.LunchInMinutes;
                        item.Description = map.Description ? cols[map.Description] : item.Description;                        
                        // todo: add project 
                        if (item.Minutes && !isNaN(item.Minutes)) {
                            item.Date = <any>(new LocalDate(item.Date));
                            items.push(item);
                        }
                    });
                    this.workItems = items;
                    resolve(items);
                };
                reader.readAsText(<any>f);
            }
        });
    }

    private parseTime(value: string, useDate?: Date): Date {
        if (!value) { return useDate; }
        var date = useDate ? new Date(useDate.getTime()) : new Date();
        var parts = value.split(':');
        if (parts.length === 2) {
            date.setHours(parseInt(parts[0]));
            date.setMinutes(parseInt(parts[1]));
            date.setSeconds(0);
        }
        return date;
    }

    private trimApostrophes(value: string, all: boolean = false): string {
        if (all) {
            let tmp = this.trimApostrophes(value);
            return tmp.replace(new RegExp('"', 'g'), '');
        }
        if (value.indexOf('"') === 0) {
            return value.substr(1, value.length - 2);
        }
        return value;
    }


    private onClose: (ok: boolean) => void = () => {};

    @HostListener('keydown', ['$event']) 
    public keyHandler(event: KeyboardEvent) {
        if (!this.isOpen) { return; }
        switch (event.keyCode) {
            case 27: // ESC
                this.onCancel();
                break;
            case 83: // S
                if (event.ctrlKey) {
                    this.onSave();
                }
                break;
        }
    }

    public open(): Promise<boolean> {
        this.isOpen = true;
        this.refresh();
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
    }

    private refresh() {
        if (this.changeDetectorRef) {
            this.changeDetectorRef.markForCheck();
        }
    }

}
