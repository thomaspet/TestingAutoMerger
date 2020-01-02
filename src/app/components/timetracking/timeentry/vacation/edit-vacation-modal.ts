import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {WorkerService} from '../../../../services/timetracking/workerService';
import {UniForm} from '../../../../../framework/ui/uniform/index';
import {WorkTimeOff, FieldType} from '../../../../unientities';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'edit-vacation-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>{{ options?.header }}</header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                {{ options?.message }}

                <uni-form
                    [config]="{ autofocus: true }"
                    [fields]="fields$"
                    [model]="current$">
                </uni-form>
                <small style="color: var(--color-bad)"> {{ errorMsg }} </small>
            </article>

            <footer>
                <button class="c2a" (click)="save()">Lagre ferie</button>
                <button class="secondary" (click)="close()">Avbryt</button>
            </footer>
        </section>`
})

export class EditVacationModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(UniForm)
    public form: UniForm;

    errorMsg: string = '';
    busy: boolean = true;
    vacation: any;
    fields$: BehaviorSubject<any> = new BehaviorSubject(null);
    current$: BehaviorSubject<WorkTimeOff> = new BehaviorSubject(new WorkTimeOff());

    constructor( private workerService: WorkerService ) { }

    public ngOnInit() {
        this.vacation = this.options.data.item;
        this.current$.next(this.vacation || new WorkTimeOff());
        this.setUpConfig();
        this.busy = false;
    }

    close(emitValue?: boolean) {
        this.onClose.emit(false);
    }

    save() {
        const vaycay = this.current$.getValue();
        this.errorMsg = '';
        if (!vaycay.FromDate || !vaycay.ToDate || !vaycay.Description) {
            this.errorMsg = 'Alle feltene må fylles ut';
            this.form.field('Description').focus();
            return;
        }

        if (vaycay.FromDate && vaycay.ToDate && moment(vaycay.FromDate).isAfter(moment(vaycay.ToDate))) {
            this.errorMsg = 'Fra dato må være før til dato!';
            return;
        }

        this.busy = true;
        this.setItemForSave(vaycay);
        this.workerService.saveTimeOff(vaycay).subscribe(() => {
            this.busy = false;
            this.onClose.emit(true);
        }, err => {
            this.errorMsg = 'Klarte ikke lagre ferie. Lukk modal og prøv på nytt';
            this.busy = false;
        });
    }

    setItemForSave(item: WorkTimeOff) {
        item.ID = item.ID || 0;
        item.TimeoffType = item.TimeoffType || 2; // Vacation
        item.WorkRelationID = item.WorkRelationID || this.options.data.workRelationID;
    }

    setUpConfig() {
        this.fields$.next([
            {
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse av ferie/fri *',
                Property: 'Description'
            },
            {
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Fra og med dato *',
                Property: 'FromDate'
            },
            {
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Til og med dato *',
                Property: 'ToDate'
            }
        ]);
    }
}
