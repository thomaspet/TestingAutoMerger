import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {PreviewModal} from '../modals/preview/previewModal';
import {ReportDefinition} from '../../../unientities';
import {ReportDefinitionService} from '../../../services/reports/ReportDefinitionService';



class ReportCategory {
    public name: string;
    public reports: Array<ReportDefinition>;
}

@Component({
    selector: 'uni-overview',
    templateUrl: 'app/components/reports/overview/overview.html',
    directives: [UniTabs, PreviewModal],
    providers: [ReportDefinitionService]
})
export class Overview {
    @ViewChild(PreviewModal)
    private previewModal: PreviewModal;
    
    public reportCategories: Array<ReportCategory>;
    
    constructor(private tabService: TabService, private reportDefinitionService: ReportDefinitionService) {
        this.tabService.addTab({name: 'Rapportoversikt', url: '/reports/overview'});
    }
    
    
    public showModalReportParameters(reportDefinition : ReportDefinition) {
        
    }
    
    public showReport(reportName : string) {
        this.previewModal.open();
    }
    
    public ngOnInit() {
        this.reportDefinitionService.GetAll<ReportDefinition>(null).subscribe(reports => {
            this.reportCategories = new Array<ReportCategory>();
            
            for (var i = 0; i < reports.length; ++i) {
                var reportCategory: ReportCategory = this.findCategory(reports[i].Category);
                
                if (reportCategory === null) {
                    reportCategory = new ReportCategory();

                    reportCategory.name = reports[i].Category;
                    reportCategory.reports = new Array<ReportDefinition>();
                    
                    this.reportCategories.push(reportCategory);
                }
                reportCategory.reports.push(reports[i]);
            }
        });
    }
    
    private findCategory(name: string) {
        var found: ReportCategory = null;
        var i: number = 0;
        
        while (i < this.reportCategories.length && found !== null) {
            if (this.reportCategories[i].name === name) {
                found = this.reportCategories[i];
            }
        }
        return found;
    }
}