import {Component, OnInit, Input, ViewChild, SimpleChanges} from '@angular/core';
import {Employee, SalaryBalanceTemplate, SalaryBalance} from '@uni-entities';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {EmployeeService, UniCacheService, ErrorService, SalarybalanceService} from '@app/services/services';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniView} from '@uni-framework/core/uniView';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import { ToastService } from '@uni-framework/uniToast/toastService';

const SALARYBALANCES_ON_TEMPLATE_KEY = 'salarybalancesontemplate';

@Component({
  selector: 'uni-salarybalance-template-employee-list',
  templateUrl: './salary-balance-template-employee-list.component.html',
  styleUrls: ['./salary-balance-template-employee-list.component.sass']
})
export class SalaryBalanceTemplateEmployeeListComponent extends UniView implements OnInit {
  @Input() currentTemplate: SalaryBalanceTemplate;
  @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
  public employees: Employee[] = [];
  public tableConfig: UniTableConfig;
  public salarybalances: SalaryBalance[] = [];


  constructor(
    router: Router,
    route: ActivatedRoute,
    cacheService: UniCacheService,
    private errorService: ErrorService,
    private salarybalanceService: SalarybalanceService,
    private employeeService: EmployeeService,
    private toastService: ToastService,
  ) {
    super(router.url, cacheService);

    route.parent.params.subscribe(paramsChange => {
      super.updateCacheKey(router.url);
      super.getStateSubject(SALARYBALANCES_ON_TEMPLATE_KEY)
        .subscribe((balances) => this.salarybalances = balances);
    });
  }

  public ngOnChanges(change: SimpleChanges) {
    Observable.forkJoin(
      this.getSalarybalancesOnTemplate(),
      this.getEmployees()
    ).subscribe((response: [SalaryBalance[], Employee[]]) => {
      const[balances, emps] = response;
      this.employees = emps;
      super.updateState(SALARYBALANCES_ON_TEMPLATE_KEY, balances, false);
      this.createConfig();
    });
  }

  public ngOnInit() {
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
          return this.employees.filter((employee: Employee) => {
            if (isNaN(searchValue)) {
              return (employee.BusinessRelationInfo.Name.toLowerCase().indexOf(searchValue)) > -1;
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
      .setAutoAddNewRow(true)
      .setColumns(columnList)
      .setChangeCallback(event => {
        const row = event.rowModel;
        row['_isDirty'] = true;
        if (event.field === 'Employee') {
          const isDuplicatedEmployees = this.salarybalances.some(x => x.EmployeeID === row.Employee.ID);
          if (isDuplicatedEmployees) {
            this.toastService.addToast(`Kan ikke legge til fordi ansatt "${row.Employee.EmployeeNumber} - ${row.Employee.BusinessRelationInfo.Name}" eksisterer allerede.`);
            row['Employee'] = null;
            return row;
          }

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
    rowModel['EmployeeID'] = emp != null ? emp.ID : 0;
    rowModel['SalaryBalanceTemplateID'] = this.currentTemplate.ID;
    rowModel['InstalmentType'] = this.currentTemplate.InstalmentType;
    rowModel['Name'] = this.currentTemplate.SalarytransactionDescription;
    rowModel['WageTypeNumber'] = this.currentTemplate.WageTypeNumber;
    rowModel['Instalment'] = this.currentTemplate.Instalment;
    rowModel['InstalmentPercent'] = this.currentTemplate.InstalmentPercent;
    rowModel['MinAmount'] = this.currentTemplate.MinAmount;
    rowModel['MaxAmount'] = this.currentTemplate.MaxAmount;
    rowModel['SupplierID'] = this.currentTemplate.SupplierID;
    rowModel['KID'] = this.currentTemplate.KID;
    rowModel['FromDate'] = new Date();
  }

  private getEmployees(): Observable<Employee[]> {
    return this.employeeService.GetAll('', ['BusinessRelationInfo']);
  }

  private getSalarybalancesOnTemplate(): Observable<SalaryBalance[]> {
    return this.currentTemplate && this.currentTemplate.ID
      ? this.salarybalanceService.getSalarybalancesOnTemplate(this.currentTemplate.ID)
      : Observable.of([]);
  }
}
