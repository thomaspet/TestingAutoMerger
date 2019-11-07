import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {SupplementService} from '../../../services/services';
import {ToastService, ToastType} from '@uni-framework//uniToast/toastService';
import {Valuetype} from '@app/unientities';


@Component({
    selector: 'uni-supplement-edit-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 35rem">
            <header>Tilleggsopplysninger</header>
            <article>
                <span style="font-size: 14px;">
                    <strong>{{ line._Name }} </strong> for ansatt
                    <strong>{{ line['_Employee'].EmployeeNumber }}: {{ line['_Employee'].BusinessRelationInfo.Name }} </strong>
                </span>

                <form style="margin-top: 1rem;">
                    <label class="uni-label label-left">
                        <span style="flex: 0 0 100px;">Verdi</span>
                        <input *ngIf="type === 1" name="Verdi" type="text" [(ngModel)]="line.ValueString">
                        <input *ngIf="type === 2" name="Verdi" type="date" [(ngModel)]="line.ValueDate">
                        <input *ngIf="type === 3" name="Verdi" type="checkbox"
                            [(ngModel)]="line.ValueBool" style="flex: none; width: 15px;">
                        <input *ngIf="type === 4" name="Verdi" type="number" [(ngModel)]="line.ValueMoney">
                        <input *ngIf="type === 5" name="Verdi" type="date" [(ngModel)]="line.ValueDate2">
                    </label>
                </form>

            </article>

            <footer>
                <button class="secondary" (click)="close()">Avbryt</button>
                <button class="c2a" (click)="save()">Lagre</button>
            </footer>
        </section>
    `
})

export class UniSupplementEditModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public line: any = {};
    public type: Valuetype = 0;

    constructor(
        private supplementService: SupplementService,
        private toast: ToastService
    ) { }

    public ngOnInit() {
        if (this.options && this.options.data) {
            this.line = this.options.data.line;
            this.type = this.line.WageTypeSupplement.ValueType;
        } else {
            this.close();
        }
    }

    public save() {
        this.supplementService.Put(this.line.ID, this.line).subscribe((res) => {
            this.toast.addToast('Lagring vellykket', ToastType.good, 5);
            this.onClose.emit(this.line);
        }, err => this.toast.addToast('Lagring feilet', ToastType.bad, 5) );
    }

    public close() {
        this.onClose.emit();
    }
}
