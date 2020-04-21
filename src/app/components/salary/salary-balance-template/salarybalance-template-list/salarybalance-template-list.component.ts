import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {SalaryBalanceTemplate} from '@uni-entities';
import {Observable} from 'rxjs';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {SalarybalanceTemplateService, ErrorService} from '@app/services/services';

@Component({
  selector: 'uni-salarybalance-template-list',
  templateUrl: './salarybalance-template-list.component.html',
  styleUrls: ['./salarybalance-template-list.component.sass']
})
export class SalarybalanceTemplateListComponent implements OnInit {

  public tableConfig: UniTableConfig;
  public templates$: Observable<SalaryBalanceTemplate>;
  public busy: boolean;

  public toolbarActions = [{
    label: 'Ny trekkmal',
    action: this.handleCreateTemplate.bind(this),
    main: true,
    disabled: false
  }];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tabService: TabService,
    private errorService: ErrorService,
    private templateService: SalarybalanceTemplateService
  ) {
    this.tabService.addTab(
      {
        name: 'Trekkmaler',
        url: '/salary/salarybalancetemplates',
        moduleID: UniModules.SalarybalanceTemplates,
        active: true
      }
    );
  }

  ngOnInit() {
    this.loadTemplates();
    this.setTableConfig();
  }

  public rowSelected(event) {
    this.router.navigateByUrl('/salary/salarybalancetemplates/' + event.ID);
  }

  public handleCreateTemplate() {
    this.router.navigateByUrl('/salary/salarybalancetemplates/0');
  }

  private loadTemplates() {
    this.busy = true;
    this.templates$ = this.templateService
      .GetAll('')
      .finally(() => this.busy = false)
      .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
  }

  private setTableConfig() {
    const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number);
    const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);
    const typeCol = new UniTableColumn('InstalmentType', 'Type')
      .setTemplate((salarybalanceTemplate: SalaryBalanceTemplate) => {
        return salarybalanceTemplate.InstalmentType ? this.templateService.getInstalment(salarybalanceTemplate).Name : '';
      });

    this.tableConfig = new UniTableConfig('salary.salarybalancetemplate.list', false, true, 20)
      .setColumns([idCol, nameCol, typeCol])
      .setSearchable(true);
  }

}
