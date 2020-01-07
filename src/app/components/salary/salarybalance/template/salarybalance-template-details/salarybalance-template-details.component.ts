import {Component, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from '../../../../../../../node_modules/rxjs';
import {SalaryBalanceTemplate, Supplier, Employee} from '@uni-entities';
import {UniForm} from '@uni-framework/ui/uniform';
import {ActivatedRoute, Router} from '@angular/router';
import {
  SalarybalanceService, ErrorService, UniCacheService
} from '@app/services/services';
import {UniView} from '@uni-framework/core/uniView';

const SALBAL_TEMPLATE_KEY = 'salarybalancetemplate';

@Component({
  selector: 'uni-salarybalance-template-details',
  templateUrl: './salarybalance-template-details.component.html',
  styleUrls: ['./salarybalance-template-details.component.sass']
})
export class SalarybalanceTemplateDetailsComponent extends UniView {

  public currentTemplate$: BehaviorSubject<SalaryBalanceTemplate> = new BehaviorSubject(new SalaryBalanceTemplate());
  public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
  public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private lastChanges$: BehaviorSubject<SimpleChanges> = new BehaviorSubject({});
  public employees: Employee[] = [];
  private ignoreFields: string[] = ['EmployeeID', 'FromDate', 'ToDate', 'SalaryBalanceTemplateID', 'Amount'];

  @ViewChild(UniForm, { static: true }) public uniform: UniForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salarybalanceService: SalarybalanceService,
    public cacheService: UniCacheService,
    private errorService: ErrorService
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

  public change(change: SimpleChanges) {
    this.currentTemplate$
      .asObservable()
      .take(1)
      .filter(() => Object
        .keys(change)
        .some(key => change[key].currentValue !== change[key].previousValue))
      .map(model => {
        if (change['InstalmentType']) {
          this.setText(model);
          this.salarybalanceService.resetFields(model);
        }

        if (change['SupplierID']) {
          this.salarybalanceService.getSuppliers()
          .subscribe((suppliers: Supplier[]) => {
            model.Supplier = suppliers.find(supp => supp.ID === model.SupplierID);
          });
          if (!model.SupplierID) {
            this.salarybalanceService.resetCreatePayment(model);
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
      .refreshLayout(currTemplate, this.ignoreFields, 'salarybalancetemplate', 'SalaryBalanceTemplateID', false)
      .map(reponse => this.setText(currTemplate))
      .subscribe(response => {
        this.currentTemplate$.next(response);
      });

  }

  private setText(salarybalanceTemplate: SalaryBalanceTemplate): SalaryBalanceTemplate {
    if (salarybalanceTemplate.ID > 0) {
      return salarybalanceTemplate;
    }
    if (!salarybalanceTemplate.InstalmentType) { return salarybalanceTemplate; }
    salarybalanceTemplate.Name = this.salarybalanceService.getInstalmentTypes()
      .find(type => type.ID === salarybalanceTemplate.InstalmentType).Name;
    return salarybalanceTemplate;
  }
}
