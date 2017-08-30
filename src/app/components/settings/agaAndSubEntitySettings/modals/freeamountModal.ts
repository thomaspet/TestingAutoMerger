import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../../framework/ui/unitable/index';
import {GrantService, SubEntityService, ErrorService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {SubEntity} from './../../../../unientities';

@Component({
    selector: 'free-amount-modal',
    templateUrl: './freeAmountModal.html'
})

export class FreeAmountModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    private freeamountTableConfig: UniTableConfig;
    private freeamountData: any[] = [];

    //
    // Jorge: can't understand why model is not used. Which is then the point of the form?
    private freeamountModel$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any>= new BehaviorSubject({submitText: ''});

    constructor(
        private _subentityService: SubEntityService,
        private _grantService: GrantService,
        private errorService: ErrorService) { }

        public ngOnInit() {
            Observable.forkJoin(
                this._subentityService.GetAll('filter=SuperiorOrganizationID gt 0', ['BusinessRelationInfo.InvoiceAddress']),
                this._grantService.GetAll('')
            ).subscribe((response) => {
                let [subs, grants] = response;
                this.freeamountData = subs;

                // remove this section when we get data from issue #2041 (backend)
                this.freeamountData.forEach(freeamount => {
                    let grantAmount: number = 0;
                    grants.forEach(grant => {
                        if (freeamount.ID === grant.SubentityID) {
                            grantAmount += grant.Amount;
                        }
                    });
                    freeamount.Grants = grantAmount;
                });

                this.setTableConfig();
                this.setFormConfig();
            }, err => this.errorService.handle(err));
        }

        private setTableConfig() {
            let subentityCol = new UniTableColumn('ID', 'Virksomhet', UniTableColumnType.Text)
            .setTemplate((dataItem: SubEntity) => {
                    let info = dataItem.BusinessRelationInfo;
                    return info ? `${dataItem.OrgNumber} - ${info.Name}` : dataItem.OrgNumber;
            });
            let maxCol = new UniTableColumn('AgaRule', 'Maks fribeløp', UniTableColumnType.Money);
            let usedCol = new UniTableColumn('AgaZone', 'Brukt fribeløp', UniTableColumnType.Money);
            let grantCol = new UniTableColumn('Grants', 'Tilskudd', UniTableColumnType.Money);

            const configStoreKey = 'settings.agaAndSubEntitySettings.freeAmountModal';
            this.freeamountTableConfig = new UniTableConfig(configStoreKey, false, true, 10)
                .setColumns([subentityCol, maxCol, usedCol, grantCol]);
        }

        private setFormConfig() {
            let totalFreeamountField = new UniFieldLayout();
            totalFreeamountField.FieldSet = 0;
            totalFreeamountField.Section = 0;
            totalFreeamountField.Combo = 0;
            totalFreeamountField.FieldType = FieldType.TEXT;
            totalFreeamountField.EntityType = 'freeamountModel';
            totalFreeamountField.Property = 'TotalFreeamount';
            totalFreeamountField.Label = 'Rest fribeløp';
            totalFreeamountField.Options = null;
            totalFreeamountField.ReadOnly = true;

            this.fields$.next([totalFreeamountField]);
        }

        public close() {
            this.onClose.next(true);
        }
}
