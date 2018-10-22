import {Component, Input, EventEmitter, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

export interface IChangeYear {
    year: number;
    checkStandard: boolean;
}

@Component({
    selector: 'select-year-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Velg år</h1></header>
            <article>
                <uni-form [config]="config$" [fields]="fields$" [model]="yearModel$"></uni-form>
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

    public fields$: BehaviorSubject<any>; // fields
    public config$: BehaviorSubject<any>; // config
    public yearModel$: BehaviorSubject<any>; // model

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<IChangeYear>();

    constructor() { }

    public ngOnInit() {

        this.modalConfig.chosen = this.options.data.year;

        this.config$ = new BehaviorSubject(this.modalConfig);
        this.yearModel$ = new BehaviorSubject(this.modalConfig);
        this.fields$ = new BehaviorSubject<any>(1);

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

        this.fields$.next([inputYear, fieldcheck]);
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
