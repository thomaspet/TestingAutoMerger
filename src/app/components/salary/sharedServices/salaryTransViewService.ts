import {Injectable} from '@angular/core';
import {
    SalaryTransaction, SalaryTransactionSupplement, Valuetype, WageTypeSupplement
} from '../../../unientities';
import {SupplementService} from '../../../services/services';
import {SalaryTransSupplementsModal} from '../modals/salaryTransSupplementsModal';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {
    UniTableColumnType,
    UniTableColumn
} from '../../../../framework/ui/unitable/index';
import * as _ from 'lodash';

@Injectable()
export class SalaryTransViewService {
    constructor(
        private supplementService: SupplementService,
        private modalService: UniModalService
    ) {}

    public createSupplementsColumn(
        onSupplementsClose: (trans: SalaryTransaction) => any,
        isReadOnly: () => boolean): UniTableColumn {
        return new UniTableColumn('Supplements', 'T', UniTableColumnType.Text, false)
            .setCls('icon-column')
            .setOnCellClick((rowModel: SalaryTransaction) => {
                if (!rowModel.Supplements || !rowModel.Supplements.length) {
                    return;
                }

                this.openSupplements(rowModel, onSupplementsClose, isReadOnly());
            })
            .setTemplate((rowModel: SalaryTransaction) => {
                if (!rowModel.Supplements || !rowModel.Supplements.length || this.isOnlyAmountField(rowModel)) {
                    return '';
                }
                let transWtSupps = rowModel.Supplements
                    .map(supp => supp.WageTypeSupplement)
                    .filter(wtSupp => !!wtSupp) || [];
                let wtSupps = transWtSupps.length
                    ? transWtSupps
                    : rowModel.Wagetype && rowModel.Wagetype.SupplementaryInformations;
                wtSupps = wtSupps || [];

                let title = this.generateSupplementsTitle(rowModel, wtSupps);
                return `{#<em class="${this.supplementService
                    .anyUnfinished(rowModel.Supplements, wtSupps)
                    ? 'info-warn'
                    : 'info-ok'}" `
                    + `title="${title}" `
                    + `role="presentation">${title}</em>#}#`;
            })
            .setWidth('2.5rem');
    }

    private isOnlyAmountField(row: SalaryTransaction) {
        let supplement = row.Supplements[0];
        let wtSupp = supplement.WageTypeSupplement
            || (row.Wagetype && row.Wagetype.SupplementaryInformations
                ? row.Wagetype.SupplementaryInformations.find(x => x.ID === supplement.WageTypeSupplementID)
                : null);
        return row.Supplements.length === 1
            && wtSupp
            && wtSupp.ValueType === Valuetype.IsMoney
            && wtSupp.Description.toLowerCase().startsWith('antall');
    }

    private generateSupplementsTitle(trans: SalaryTransaction, wtSupps: WageTypeSupplement[]): string {
        if (this.supplementService.anyUnfinished(trans.Supplements, wtSupps)) {
            return 'Tilleggsopplysninger mangler';
        }
        let supplements = _.cloneDeep(trans.Supplements);
        let title = ``;
        let last = supplements.pop();
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
        let displayVal = this.supplementService.displaySupplement(supp, wtSupp);
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
