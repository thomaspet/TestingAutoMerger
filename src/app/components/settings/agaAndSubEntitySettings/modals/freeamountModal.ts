import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../../framework/ui/unitable/index';
import {ErrorService, AgaSumService} from '../../../../services/services';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {FreeAmountSummary, AGASums} from './../../../../unientities';

@Component({
    selector: 'free-amount-modal',
    templateUrl: './freeamountModal.html'
})

export class FreeAmountModal implements OnInit, IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    public freeamountTableConfig: UniTableConfig;
    public freeamountData$: BehaviorSubject<AGASums[]> = new BehaviorSubject([]);
    public freeamountModel$: BehaviorSubject<FreeAmountSummary> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({submitText: ''});

    constructor(
        private errorService: ErrorService,
        private agaSumService: AgaSumService
    ) {}

    public ngOnInit() {
        this.getData().subscribe(() => {
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
                this.freeamountModel$.next(summary);
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private setTableConfig() {
        const subentityCol = new UniTableColumn('_name', 'Virksomhet', UniTableColumnType.Text);
        const maxCol = new UniTableColumn('MaxFreeAmount', 'Maks fribeløp', UniTableColumnType.Number);
        const usedCol = new UniTableColumn('UsedFreeAmount', 'Brukt fribeløp', UniTableColumnType.Number);
        const grantCol = new UniTableColumn('GrantSum', 'Tilskudd', UniTableColumnType.Number);

        const configStoreKey = 'settings.agaAndSubEntitySettings.freeAmountModal';
        this.freeamountTableConfig = new UniTableConfig(configStoreKey, false, true, 10)
            .setColumns([subentityCol, maxCol, usedCol, grantCol]);
    }

    private setFormConfig() {
        const totalFreeamountField = new UniFieldLayout();
        totalFreeamountField.FieldSet = 0;
        totalFreeamountField.Section = 0;
        totalFreeamountField.Combo = 0;
        totalFreeamountField.FieldType = FieldType.TEXT;
        totalFreeamountField.EntityType = 'freeamountModel';
        totalFreeamountField.Property = 'RestFreeAmount';
        totalFreeamountField.Label = 'Rest fribeløp';
        totalFreeamountField.Options = null;
        totalFreeamountField.ReadOnly = true;

        this.fields$.next([totalFreeamountField]);
    }

    public close() {
        this.onClose.next(true);
    }
}
