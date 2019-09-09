import {Component, Input, EventEmitter, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform/index';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

export interface IChangeYear {
    year: number;
}

@Component({
    selector: 'select-year-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>Velg år</header>
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

        const inputYear = new UniFieldLayout();
        inputYear.Label = 'År';
        inputYear.FieldType = FieldType.TEXT;
        inputYear.ReadOnly = false;
        inputYear.Property = 'chosen';
        inputYear.EntityType = 'config';

        this.fields$.next([inputYear]);
    }

    public changeYear() {
        this.close({
            year: parseInt(this.modalConfig.chosen, 10)
        });
    }

    public close(chYr: IChangeYear = null): void {
        this.onClose.emit(chYr);
    }
}
