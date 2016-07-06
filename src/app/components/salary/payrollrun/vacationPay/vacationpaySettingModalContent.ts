import {Component, Input, ViewChild} from '@angular/core';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {CompanySalaryService} from '../../../../services/services';
import {FieldType} from '../../../../unientities';

@Component({
    selector: 'vacationpay-setting-modal-content',
    directives: [UniForm],
    providers: [CompanySalaryService],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaysettingmodalcontent.html'
})
export class VacationpaySettingModalContent {
    private busy: boolean;
    private fields: UniFieldLayout[] = [];
    private companysalaryModel: any = {};
    @Input() private config: any;
    @ViewChild(UniForm) private uniform: UniForm;
    private formConfig: any = {};

    constructor(private _companysalaryService: CompanySalaryService) {
        this.busy = true;
        _companysalaryService.getCompanySalary()
        .subscribe((response) => {
            this.companysalaryModel = response[0];
            this.formConfig = {
                submitText: ''
            };
            console.log('companysalary', this.companysalaryModel);
            this.setFormFields();
            this.busy = false;
        });
    }

    public saveSettings() {
        console.log('settings saved');
    }

    private setFormFields() {
        console.log('form should be set here');

        var mainAccountAllocatedVacation = new UniFieldLayout();
        mainAccountAllocatedVacation.Label = 'Balanse feriepenger';
        mainAccountAllocatedVacation.Property = 'MainAccountAllocatedVacation';
        mainAccountAllocatedVacation.FieldType = FieldType.TEXT;

        var mainAccountCostVacation = new UniFieldLayout();
        mainAccountCostVacation.Label = 'Resultat feriepenger';
        mainAccountCostVacation.Property = 'MainAccountCostVacation';
        mainAccountCostVacation.FieldType = FieldType.TEXT;

        this.fields = [mainAccountAllocatedVacation, mainAccountCostVacation];
    }
}
