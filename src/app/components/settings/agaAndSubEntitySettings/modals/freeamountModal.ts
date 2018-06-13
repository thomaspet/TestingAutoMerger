import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../../framework/ui/unitable/index';
import {
    GrantService, SubEntityService, ErrorService, YearService, PayrollrunService, AgaSumService
} from '../../../../services/services';
import {Observable, BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {FreeAmountSummary, AGASums} from './../../../../unientities';
interface IFreeAmountData {
    name?: string;
    grant?: number;
    maxFreeAmount?: number;
    usedFreeAmount?: number;
}

@Component({
    selector: 'free-amount-modal',
    templateUrl: './freeAmountModal.html'
})

export class FreeAmountModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    public freeamountTableConfig: UniTableConfig;
    public freeamountData$: BehaviorSubject<AGASums[]> = new BehaviorSubject([]);

    //
    // Jorge: can't understand why model is not used. Which is then the point of the form?
    public freeamountModel$: BehaviorSubject<number> = new BehaviorSubject(0);
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({submitText: ''});

    constructor(
        private _subentityService: SubEntityService,
        private _grantService: GrantService,
        private errorService: ErrorService,
        private yearService: YearService,
        private payrollRunService: PayrollrunService,
        private agaSumService: AgaSumService
    ) {}

    public ngOnInit() {
        this.getData()
            .subscribe(() => {
                this.setTableConfig();
                this.setFormConfig();
            });
    }

    private getData(): Observable<FreeAmountSummary> {
        return this.agaSumService
            .getFreeAmountSummary()
            .do(summary => {
                this.freeamountData$.next(summary.SubEntitiesSums.map(data => {
                    if (!data.SubEntity) {
                        return;
                    }

                    data.Sums['_name'] = data.SubEntity.BusinessRelationInfo
                        ? `${data.SubEntity.OrgNumber} - ${data.SubEntity.BusinessRelationInfo.Name}`
                        : data.SubEntity.OrgNumber || data.SubEntity.ID;
                    return data.Sums;
                }));
                this.freeamountModel$.next(summary.RestFreeAmount);
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private setTableConfig() {
        let subentityCol = new UniTableColumn('_name', 'Virksomhet', UniTableColumnType.Text);
        let maxCol = new UniTableColumn('MaxFreeAmount', 'Maks fribeløp', UniTableColumnType.Money);
        let usedCol = new UniTableColumn('UsedFreeAmount', 'Brukt fribeløp', UniTableColumnType.Money);
        let grantCol = new UniTableColumn('GrantSum', 'Tilskudd', UniTableColumnType.Money);

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
