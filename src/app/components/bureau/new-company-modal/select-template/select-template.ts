import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Company} from '@uni-entities';

@Component({
    selector: 'uni-select-template',
    templateUrl: './select-template.html',
    styleUrls: ['./select-template.sass']
})
export class SelectTemplate {
    @Input() templateCompanies: Company[];
    @Input() selectedTemplateCompany: Company;
    @Output() selectedTemplateCompanyChange = new EventEmitter();

    onTemplateCompanyClick(company) {
        if (this.selectedTemplateCompany && this.selectedTemplateCompany.ID === company.ID) {
            this.selectedTemplateCompanyChange.emit(undefined);
        } else {
            this.selectedTemplateCompanyChange.emit(company);
        }
    }
}
