import {Component, Input, EventEmitter, Output} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../../../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniModal, IModalOptions} from '../../../../../../../framework/uniModal/barrel';

export interface IChangeYear {
    year: number;
    checkStandard: boolean;
}

@Component({
    selector: 'select-year-modal',
    template: `
        <section role="dialog" class="uni-modal account_detail_modal_size">
            <header><h1>Velg år</h1></header>
            <article>
                <uni-form [config]="config$" [fields]="lay$" [model]="yearModel$"></uni-form>
            </article>
            <footer>
                <button (click)="changeYear()" class="good">Endre</button>
                <button (click)="close()" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})
export class YearModal implements IUniModal {
    public modalConfig: any = {
        title: 'Velg År',
        chosen: new Date().getFullYear(),
        checkStandard: false,
        cancel: () => {
            this.close();
        },
        disabled: true
    };
    private lay$: BehaviorSubject<any>; // fields
    private config$: BehaviorSubject<any>; // config
    private yearModel$: BehaviorSubject<any>; // model

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<IChangeYear>();

    constructor() { }

    public ngOnInit() {

        this.modalConfig.chosen = this.options.data.year;

        this.config$ = new BehaviorSubject(this.modalConfig);
        this.yearModel$ = new BehaviorSubject(this.modalConfig);
        this.lay$ = new BehaviorSubject<any>(1);

        let inputYear = new UniFieldLayout();
        inputYear.Label = 'År';
        inputYear.FieldType = FieldType.TEXT;
        inputYear.ReadOnly = false;
        inputYear.Property = 'chosen';
        inputYear.EntityType = 'config';

        let fieldcheck = new UniFieldLayout();
        fieldcheck.EntityType =  'config';
        fieldcheck.Label = 'Standard regnskapsår';
        fieldcheck.FieldType = FieldType.CHECKBOX;
        fieldcheck.ReadOnly = false;
        fieldcheck.LookupField = false;
        fieldcheck.Property = 'checkStandard';

        this.lay$.next([inputYear, fieldcheck]);
    }

    public changeYear() {
        this.close({
            checkStandard: this.modalConfig.checkStandard,
            year: parseInt(this.modalConfig.chosen)
        });
    }

    public close(chYr: IChangeYear = null): void {
        this.onClose.emit(chYr);
    }

}
