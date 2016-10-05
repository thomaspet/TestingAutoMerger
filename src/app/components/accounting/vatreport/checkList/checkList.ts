import {Component, Input} from '@angular/core';
import {VatReportMessage, ValidationLevel} from '../../../../unientities';

@Component({
    selector: 'vatreport-checklist-view',
    templateUrl: 'app/components/accounting/vatreport/checkList/checkList.html'
})
export class CheckListVat {
    @Input() public vatReportMessages: VatReportMessage[];

    public levelToClass(level: ValidationLevel) {
        switch (level) {
            case ValidationLevel.Info:
                return 'success';
            case ValidationLevel.Warning:
                return 'warn';
            case ValidationLevel.Error:
                return 'error';
        }
    }
}
