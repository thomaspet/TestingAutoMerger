import {
    Component,
    Input,
    Output,
    ViewChild,
    EventEmitter,
} from '@angular/core';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {VatDeductionGroup} from '../../../../../app/unientities';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {
    VatDeductionGroupService,
    VatDeductionService,
    ErrorService
} from '../../../../services/services';

@Component({
    selector: 'vatdeductiongroup-setup-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Oversikt over forholdsmessig MVA grupper</h1></header>
            <article class='modal-content'>
                <p>
                    Rediger eller legg til grupper under hvis du ønsker å bruke forskjellige satser for
                    forholdsmessig fradrag av MVA. Disse satsene vil bli tilgjengelige inne i kontoplanen
                </p>
                <uni-table
                    [resource]="lookupFunction"
                    [config]="uniTableConfig">
                </uni-table>
            </article>
            <footer>
                <button (click)="save()" class="good">Lagre endringer</button>
                <button (click)="close(null)">Avbryt</button>
            </footer>
        </section>
    `
})
export class VatDeductionGroupSetupModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniTable)
    public unitable: UniTable;

    public uniTableConfig: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;

    public isDirty: boolean = false;

    constructor(
        private toastService: ToastService,
        private vatDeductionGroupService: VatDeductionGroupService,
        private vatDeductionService: VatDeductionService,
        private errorService: ErrorService
    ) {

    }

    public ngOnInit() {
        this.uniTableConfig = this.generateUniTableConfig();
        this.lookupFunction = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getTableData(urlParams: URLSearchParams): Observable<VatDeductionGroup[]> {
        urlParams = urlParams || new URLSearchParams();

        if (!urlParams.get('orderby')) {
            urlParams.set('orderby', 'Name');
        }

        return this.vatDeductionGroupService.GetAllByUrlSearchParams(urlParams);
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig('accounting.vatDeductionGroupSetup.vatDeductionGroups', true, false)
            .setPageable(false)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setColumns([
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
            ])
            .setChangeCallback((event) => {
                this.isDirty = true;

                const rowModel = event.rowModel;
                rowModel._isDirty = true;

                return rowModel;
            });
    }

    public save() {
        // run a setTimeout first to get the last changes the user has done
        // in case he/she has not exited from the editable table before clicking
        // the button
        setTimeout(() => {
            const data = this.unitable.getTableData();

            const dirtyRows = [];
            data.forEach(x => {
                if (x._isDirty) {
                    dirtyRows.push(x);
                }
            });

            const requests = [];

            dirtyRows.forEach(row => {
                if (row.Name && row.Name !== '') {
                    if (row.ID > 0) {
                        requests.push(this.vatDeductionGroupService.Put(row.ID, row));
                    } else {
                        requests.push(this.vatDeductionGroupService.Post(row));
                    }
                }
            });

            if (requests.length > 0) {
                Observable.forkJoin(requests)
                    .subscribe(res => {
                        this.toastService.addToast('Lagring vellykket', ToastType.good, ToastTime.short);

                        this.vatDeductionService.invalidateCache();

                        this.onClose.emit({didSave: true});
                    },
                    err => {
                        this.errorService.handle(err);
                    }
                );
            } else {
                this.toastService.addToast('Ingen endringer funnet', ToastType.warn, ToastTime.short);
            }
        });
    }

    public close() {
        this.onClose.emit({didSave: false});
    }
}
