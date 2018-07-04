import {Injectable} from '@angular/core';
import {
    SalaryTransaction, SalaryTransactionSupplement, Valuetype, WageTypeSupplement, VatType, LocalDate
} from '../../../unientities';
import {SupplementService, VatTypeService} from '../../../services/services';
import {SalaryTransSupplementsModal} from '../modals/salaryTransSupplementsModal';
import {UniModalService} from '../../../../framework/uni-modal';
import {
    UniTableColumnType,
    UniTableColumn
} from '../../../../framework/ui/unitable/index';
import * as _ from 'lodash';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class SalaryTransViewService {

    private vatTypes$: BehaviorSubject<VatType[]> = new BehaviorSubject(null);
    constructor(
        private supplementService: SupplementService,
        private modalService: UniModalService,
        private vatTypesService: VatTypeService
    ) {}

    public createVatTypeColumn(): UniTableColumn {
        return new UniTableColumn('VatType', 'Moms', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((rowModel: SalaryTransaction) => {
                const vatType = rowModel.VatType;
                if (vatType) {
                    return `${vatType.VatCode}: ${this.getPercent(vatType, rowModel)}%`;
                }
                return '';
            })
            .setOptions({
                itemTemplate: (selectedItem: VatType) => {
                    return (`${selectedItem.VatCode}:${selectedItem.Name} - ${selectedItem.VatPercent || 0}%`);
                },
                lookupFunction: (searchValue) =>
                    this.getVatTypes(
                        type => type.VatCode.toString().startsWith(searchValue) ||
                        type.VatPercent.toString().startsWith(searchValue) ||
                        type.Name.toLowerCase().includes(searchValue.toLowerCase())),
                groupConfig: {
                    groupKey: 'VatCodeGroupingValue',
                    visibleValueKey: 'Visible',
                    groups: [
                        {
                            key: 1,
                            header: 'Kjøp/kostnader.'
                        },
                        {
                            key: 2,
                            header: 'Kjøp/Importfaktura'
                        },
                        {
                            key: 3,
                            header: 'Import/Mva-beregning'
                        },
                        {
                            key: 4,
                            header: 'Salg/inntekter'
                        },
                        {
                            key: 5,
                            header: 'Salg uten mva.'
                        },
                        {
                            key: 6,
                            header: 'Kjøpskoder, spesielle'
                        },
                        {
                            key: 7,
                            header: 'Egendefinerte koder'
                        }
                    ]
                }
            });
    }

    private getPercent(vatType: VatType, rowModel: SalaryTransaction): number {
        const percentage = vatType.VatTypePercentages.find(x =>
            x.ValidFrom <= new LocalDate(rowModel.FromDate) &&
            (x.ValidTo >= new LocalDate(rowModel.FromDate) || !x.ValidTo));
        return vatType.VatPercent || percentage && percentage.VatPercent || 0;
    }

    private getVatTypes(filter: (type: VatType) => boolean): Observable<VatType[]> {
        return this.vatTypes$
            .take(1)
            .switchMap(vatTypes => {
                return vatTypes
                    ? Observable.of(vatTypes)
                    : this.vatTypesService.GetAll('').do(types => this.vatTypes$.next(types));
            })
            .map((vatTypes: VatType[]) => vatTypes.filter(filter));
    }

    public createSupplementsColumn(
        onSupplementsClose: (trans: SalaryTransaction) => any,
        isReadOnly: () => boolean): UniTableColumn {
        return new UniTableColumn('Supplements', 'Tilleggsopplysning', UniTableColumnType.Text, false)
            .setWidth(40)
            .setResizeable(false)
            .setOnCellClick((rowModel: SalaryTransaction) => {
                if (!rowModel.Supplements || !rowModel.Supplements.filter(x => !x.Deleted).length) {
                    return;
                }

                this.openSupplements(rowModel, onSupplementsClose, isReadOnly());
            })
            .setTemplate(() => '')
            .setTooltipResolver((row: SalaryTransaction) => {
                if (!row.Supplements || !row.Supplements.filter(x => !x.Deleted).length || this.isOnlyAmountField(row)) {
                    return;
                }

                const transWtSupps = row.Supplements
                    .map(supp => supp.WageTypeSupplement)
                    .filter(wtSupp => !!wtSupp) || [];
                let wtSupps = transWtSupps.length
                    ? transWtSupps
                    : row.Wagetype && row.Wagetype.SupplementaryInformations;
                wtSupps = wtSupps || [];

                const text = this.generateSupplementsTitle(row, wtSupps);
                const type = this.supplementService.anyUnfinished(row.Supplements, wtSupps)
                    ? 'warn' : 'good';

                return {
                    type: type,
                    text: text
                };
            });
        }

    private isOnlyAmountField(row: SalaryTransaction) {
        const supplement = row.Supplements.filter(x => !x.Deleted)[0];
        const wtSupp = supplement.WageTypeSupplement
            || (row.Wagetype && row.Wagetype.SupplementaryInformations
                ? row.Wagetype.SupplementaryInformations.find(x => x.ID === supplement.WageTypeSupplementID)
                : null);
        return row.Supplements.length === 1
            && wtSupp
            && wtSupp.ValueType === Valuetype.IsMoney
            && wtSupp.Name.toLowerCase().trim().startsWith('antall');
    }

    private generateSupplementsTitle(trans: SalaryTransaction, wtSupps: WageTypeSupplement[]): string {
        if (this.supplementService.anyUnfinished(trans.Supplements, wtSupps)) {
            return 'Tilleggsopplysninger mangler';
        }
        const supplements = _.cloneDeep(trans.Supplements);
        let title = ``;
        const last = supplements.pop();
        supplements
            .forEach(supp => title += this.getDisplayVal(supp, trans));
        title += this.getDisplayVal(last, trans);

        return title || 'Tilleggsopplysninger ok';
    }

    private getDisplayVal(supp: SalaryTransactionSupplement, trans: SalaryTransaction): string {
        let wtSupp = supp.WageTypeSupplement;
        if (!wtSupp && trans.Wagetype && trans.Wagetype.SupplementaryInformations) {
            wtSupp = trans.Wagetype.SupplementaryInformations.find(wt => wt.ID === supp.WageTypeSupplementID);
        }
        const displayVal = this.supplementService.displaySupplement(supp, wtSupp);
        return !displayVal
            ? ''
            : `${displayVal}
`;
    }

    public openSupplements(row: SalaryTransaction, onClose: (trans: SalaryTransaction) => any, readOnly: boolean) {
        this.modalService
            .open(SalaryTransSupplementsModal, {
                data: row,
                modalConfig: {readOnly: readOnly}
            })
            .onClose
            .subscribe((trans: SalaryTransaction) => onClose(trans));
    }
}
