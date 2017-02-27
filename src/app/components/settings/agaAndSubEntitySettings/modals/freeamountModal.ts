import { Component, ViewChild, Type, Input, OnInit } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from 'unitable-ng2/main';
import { GrantService, SubEntityService, ErrorService } from '../../../../services/services';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';

@Component({
    selector: 'freeamount-modal-content',
    templateUrl: './freeamountModal.html'
})
export class FreeamountModalContent implements OnInit {
    @Input() public config: any;
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
        private errorService: ErrorService) {

    }

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
        .setTemplate((dataItem) => {
                return `${dataItem.OrgNumber} - ${dataItem.BusinessRelationInfo.Name}`;
        });
        let maxCol = new UniTableColumn('AgaRule', 'Maks fribeløp', UniTableColumnType.Money);
        let usedCol = new UniTableColumn('AgaZone', 'Brukt fribeløp', UniTableColumnType.Money);
        let grantCol = new UniTableColumn('Grants', 'Tilskudd', UniTableColumnType.Money);

        this.freeamountTableConfig = new UniTableConfig(false, true, 10)
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
}

@Component({
    selector: 'freeamount-modal',
    template: `<uni-modal [type]="type" [config]="freeamountModalConfig"></uni-modal>`
})
export class FreeamountModal {
    @ViewChild(UniModal) private modal: UniModal;
    public freeamountModalConfig: any = {};
    public type: Type<any> = FreeamountModalContent;

    constructor() {
        this.freeamountModalConfig = {
            title: 'Fribeløp pr virksomhet',
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            }
        };
    }

    public openFreeamountModal() {
        this.modal.open();
    }
}
