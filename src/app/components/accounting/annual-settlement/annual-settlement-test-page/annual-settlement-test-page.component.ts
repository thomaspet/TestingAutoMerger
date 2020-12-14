import {Component} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {FieldType} from '@uni-framework/ui/uniform';

@Component({
    selector: 'annual-settlement-test-page-component',
    templateUrl: './annual-settlement-test-page.component.html',
    styles: [`
        .row { margin: 15px 50px; }
        h1, h2, h3, h4, h5 { margin: 0;}
        section.row { display: block;}
    `]
})
export class AnnualSettlementTestPageComponent {
    formFields = [
        {
            Property: 'FremforbartUnderskudd.Value',
            Label: 'FremforbartUnderskudd',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'Kredittsalg.Value',
            Label: 'Kredittsalg',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'KredittsalgFjoraret.Value',
            Label: 'KredittsalgFjoraret',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning.Value',
            Label: 'LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret.Value',
            Label: 'LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningInnkjopteVarerVideresalgNedskrivning.Value',
            Label: 'LagerbeholdningInnkjopteVarerVideresalgNedskrivning',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret.Value',
            Label: 'LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningRavarerHalvfabrikataNedskrivning.Value',
            Label: 'LagerbeholdningRavarerHalvfabrikataNedskrivning',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret.Value',
            Label: 'LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningVarerIArbeidNedskrivning.Value',
            Label: 'LagerbeholdningVarerIArbeidNedskrivning',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'LagerbeholdningVarerIArbeidNedskrivningFjoraret.Value',
            Label: 'LagerbeholdningVarerIArbeidNedskrivningFjoraret',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'UtbytteBelop.Value',
            Label: 'UtbytteBelop',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'test.Value',
            Label: 'test',
            FieldType: FieldType.TEXT,
        },
    ];
    annualSettlementFields = {};
    onDestroy$ = new Subject();
    annualSettlement = null;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annualSettlementService: AnnualSettlementService
    ) {
    }

    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id),
            switchMap(id => this.annualSettlementService.getAnnualSettlementWithReconcile(id))
        ).subscribe(annualSettlement => {
            this.annualSettlement = annualSettlement;
            this.annualSettlementFields = annualSettlement.Fields;
        });
    }
    transition(fromStep: number, toStep: number) {
        const transitionMethod = `moveFromStep${fromStep}ToStep${toStep}`;
        this.annualSettlement.Fields = this.annualSettlementFields;
        if (this.annualSettlementService[transitionMethod]) {
            this.annualSettlementService[transitionMethod](this.annualSettlement).subscribe(result => {
                this.annualSettlementService.getAnnualSettlementWithReconcile(this.annualSettlement.ID)
                    .subscribe(annualSettlement => {
                        this.annualSettlement = annualSettlement;
                        this.annualSettlementFields = annualSettlement.Fields;
                    });
            });
        }
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
