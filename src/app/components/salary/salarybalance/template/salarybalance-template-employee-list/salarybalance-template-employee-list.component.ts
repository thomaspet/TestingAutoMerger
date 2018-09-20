import {Component, OnInit, Input, ViewChild, SimpleChanges} from '@angular/core';
import {Employee, SalaryBalanceTemplate, SalaryBalance} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {EmployeeService, UniCacheService, ErrorService, SalarybalanceService} from '@app/services/services';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniView} from '@uni-framework/core/uniView';
import {Router, ActivatedRoute} from '../../../../../../../node_modules/@angular/router';

const SALARYBALANCES_ON_TEMPLATE_KEY = 'salarybalancesontemplate';

@Component({
  selector: 'uni-salarybalance-template-employee-list',
  templateUrl: './salarybalance-template-employee-list.component.html',
  styleUrls: ['./salarybalance-template-employee-list.component.sass']
})
export class SalarybalanceTemplateEmployeeListComponent extends UniView implements OnInit {
  @Input() currentTemplate: SalaryBalanceTemplate;
  @ViewChild(AgGridWrapper) private table: AgGridWrapper;
  public employees: Employee[] = [];
  public tableConfig: UniTableConfig;
  public salarybalances: SalaryBalance[] = [];

  constructor(
    router: Router,
    route: ActivatedRoute,
    cacheService: UniCacheService,
    private errorService: ErrorService,
    private salarybalanceService: SalarybalanceService,
    private employeeService: EmployeeService
  ) {
    super(router.url, cacheService);

    route.parent.params.subscribe(paramsChange => {
      super.updateCacheKey(router.url);
      super.getStateSubject(SALARYBALANCES_ON_TEMPLATE_KEY)
        .subscribe(salarybalances => {
          this.salarybalances = salarybalances;
        },
        err => this.errorService.handle(err));
    });

   }

  public ngOnInit() {
    this.createConfig();
  }

  public ngOnChanges(change: SimpleChanges) {
    if (!change.currentTemplate.firstChange) {
      this.getEmployees();
      this.getEmployeesOnTemplate();
    }
  }

  public onRowDelete(event) {
  }

  public onRowChange(event) {
  }

  private createConfig() {
    const empCol = new UniTableColumn('Employee', 'Ansatt', UniTableColumnType.Lookup)
    .setTemplate((rowModel) => {
      const emp = rowModel['Employee'];
      return emp
        ? emp.BusinessRelationInfo
          ? `${emp.EmployeeNumber} - ${emp.BusinessRelationInfo.Name}`
          : emp.EmployeeNumber.toString()
        : '';
    })
    .setOptions({
      itemTemplate: (selectedItem: Employee) => {
        return (selectedItem.EmployeeNumber + ' - ' + selectedItem.BusinessRelationInfo.Name);
      },
      lookupFunction: (searchValue) => {
        return this.employees.filter((employee) => {
          if (isNaN(searchValue)) {
            return (employee.BusinessRelationInfo.Name.toLowerCase().indexOf(searchValue) > -1);
          } else {
            return employee.EmployeeNumber.toString().startsWith(searchValue.toString());
          }
        });
      }
    });
    const fromDateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate, true);
    const ToDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate, true);

    const columnList = [empCol, fromDateCol, ToDateCol];
    this.tableConfig = new UniTableConfig('salary.salarybalancetemplate.salarybalancelist', true, true, 20)
      .setDeleteButton(true)
      .setAutoAddNewRow(true)
      .setColumns(columnList)
      .setChangeCallback(event => {
        const row = event.rowModel;
        row['_isDirty'] = true;
        if (event.field === 'Employee') {
          this.mapEmployeeToSalarybalance(row);
        }
        const updateIndex = this.salarybalances.findIndex(x => x['_originalIndex'] === row['_originalIndex']);
        if (updateIndex > -1) {
          this.salarybalances[updateIndex] = row;
      } else {
          this.salarybalances.push(row);
      }
      this.table.updateRow(row['_originalIndex'], row);
      super.updateState(SALARYBALANCES_ON_TEMPLATE_KEY, this.salarybalances, true);
      });
  }

  private mapEmployeeToSalarybalance(rowModel) {
    const emp = rowModel['Employee'];
    rowModel['EmployeeID'] = emp.ID;
    rowModel['SalaryBalanceTemplateID'] = this.currentTemplate.ID;
    rowModel['InstalmentType'] = this.currentTemplate.InstalmentType;
    rowModel['Name'] = this.currentTemplate.Name;
    rowModel['WageTypeNumber'] = this.currentTemplate.WageTypeNumber;
    rowModel['Instalment'] = this.currentTemplate.Instalment;
    rowModel['InstalmentPercent'] = this.currentTemplate.InstalmentPercent;
    rowModel['SupplierID'] = this.currentTemplate.SupplierID;
    rowModel['KID'] = this.currentTemplate.KID;
  }

  private getEmployees() {
    this.employeeService.GetAll('', ['BusinessRelationInfo'])
      .subscribe((emps: Employee[]) => {
        this.employees = emps;
      });
  }

  private getEmployeesOnTemplate() {
    if (this.currentTemplate && this.currentTemplate.ID > 0) {
      this.salarybalanceService
      .getSalarybalancesOnTemplate(this.currentTemplate.ID)
      .subscribe((balances: SalaryBalance[]) => {
        if (balances && balances.length > 0) {
          this.salarybalances = balances;
        }
      });
    }
  }

}
