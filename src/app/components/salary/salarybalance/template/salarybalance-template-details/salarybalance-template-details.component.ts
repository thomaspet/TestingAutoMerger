import {Component, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from '../../../../../../../node_modules/rxjs';
import {SalaryBalanceTemplate, SalBalType, WageType, StdWageType, SupplementInfo, Supplier, Employee} from '@uni-entities';
import {UniForm} from '@uni-framework/ui/uniform';
import {ActivatedRoute, Router} from '@angular/router';
import {
  SalarybalanceService, ErrorService, UniCacheService, WageTypeService, SupplierService, EmployeeService
} from '@app/services/services';
import {UniView} from '@uni-framework/core/uniView';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

const SALBAL_TEMPLATE_KEY = 'salarybalancetemplate';

@Component({
  selector: 'uni-salarybalance-template-details',
  templateUrl: './salarybalance-template-details.component.html',
  styleUrls: ['./salarybalance-template-details.component.sass']
})
export class SalarybalanceTemplateDetailsComponent extends UniView implements OnInit {

  public currentTemplate$: BehaviorSubject<SalaryBalanceTemplate> = new BehaviorSubject(new SalaryBalanceTemplate());
  public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
  public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private lastChanges$: BehaviorSubject<SimpleChanges> = new BehaviorSubject({});
  public employees: Employee[] = [];
  private ignoreFields: string[] = ['EmployeeID', 'FromDate', 'ToDate', 'SalaryBalanceTemplateID'];

  @ViewChild(UniForm) public uniform: UniForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salarybalanceService: SalarybalanceService,
    public cacheService: UniCacheService,
    private errorService: ErrorService,
    private toastService: ToastService
  ) {
    super(router.url, cacheService);
    this.route.parent.params
      .subscribe(params => {
        super.updateCacheKey(router.url);
        super.getStateSubject(SALBAL_TEMPLATE_KEY)
          .switchMap(salarybalanceTemplate =>
            salarybalanceService.updateFields(
              salarybalanceTemplate,
              'salarybalancetemplate',
              salarybalanceTemplate.ID !== this.currentTemplate$.getValue().ID,
              null,
              this.lastChanges$,
              this.uniform,
              this.fields$,
              this.ignoreFields)
          )
          .subscribe((salarybalanceTemplate: SalaryBalanceTemplate) => {
            if (salarybalanceTemplate.ID !== this.currentTemplate$.getValue().ID) {
              this.setup(salarybalanceTemplate);
            }
          }, err => this.errorService.handle(err));
      });
   }

  ngOnInit() {
  }

  public change(change: SimpleChanges) {
    this.currentTemplate$
      .asObservable()
      .take(1)
      .filter(() => Object
        .keys(change)
        .some(key => change[key].currentValue !== change[key].previousValue))
      .map(model => {
        if (change['InstalmentType']) {
          this.setWagetype(model);
          this.setText(model);
          this.salarybalanceService.resetFields(model);
        }

        if (change['SupplierID']) {
          model.Supplier = this.salarybalanceService.getSuppliers().find(supp => supp.ID === model.SupplierID);
          if (!model.SupplierID) {
            this.salarybalanceService.resetCreatePayment(model);
          }
        }

        if (change['Amount']) {
          if (change['Amount'].currentValue < 0) {
            let message = '';
            switch (model.InstalmentType) {
              case SalBalType.Advance:
                message = 'Du prøver å føre et forskudd med et negativt beløp';
                break;
              default:
                message = 'Du prøver å føre et trekk med negativ saldo';
            }
            if (message) {
              this.toastService.addToast('Feil i beløp',
                ToastType.warn, ToastTime.medium,
                message);
            }
          }
        }

        if (change['CreatePayment']) {
          this.salarybalanceService.validateCreatePaymentChange(model);
        }

        return model;
      })
      .do(() => this.lastChanges$.next(change))
      .subscribe((model: SalaryBalanceTemplate) => {
        this.currentTemplate$.next(model);
        super.updateState(SALBAL_TEMPLATE_KEY, model, true);
      });
  }

  public onEmployeeChange(event) {
  }

  private setup(currTemplate: SalaryBalanceTemplate) {
    this.salarybalanceService
      .refreshLayout(currTemplate, this.ignoreFields, 'salarybalancetemplate')
      .map(response => this.setWagetype(currTemplate))
      .map(reponse => this.setText(currTemplate))
      .subscribe(response => {
        this.currentTemplate$.next(response);
      });

  }

  private setWagetype(salarybalance: SalaryBalanceTemplate, wagetypes = this.salarybalanceService.getWagetypes()): SalaryBalanceTemplate {
    let wagetype: WageType;
    if (!salarybalance.ID && wagetypes) {
        switch (salarybalance.InstalmentType) {
            case SalBalType.Advance:
                wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.AdvancePayment);
                break;
            case SalBalType.Contribution:
                wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.Contribution);
                break;
            case SalBalType.Garnishment:
                wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.Garnishment);
                break;
            case SalBalType.Outlay:
                wagetype = wagetypes.find(wt => wt.StandardWageTypeFor === StdWageType.Outlay);
                break;
        }
        salarybalance.WageTypeNumber = wagetype ? wagetype.WageTypeNumber : 0;
    }

    return salarybalance;
  }

  private setText(salarybalanceTemplate: SalaryBalanceTemplate): SalaryBalanceTemplate {
      if (!salarybalanceTemplate.InstalmentType) { return salarybalanceTemplate; }
      salarybalanceTemplate.Name = this.salarybalanceService.getInstalmentTypes()
        .find(type => type.ID === salarybalanceTemplate.InstalmentType).Name;
      return salarybalanceTemplate;
  }
}
