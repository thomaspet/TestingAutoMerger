import {ChangeDetectorRef, Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService, StatisticsService } from '@app/services/services';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AnnualSettlementService } from '../annual-settlement.service';

@Component({
	selector: 'writeof-difference',
	templateUrl: './annual-settlement-writeof-difference.html',
	styleUrls: ['./annual-settlement-writeof-difference.sass']
})

// FremforbartUnderskudd - 	Akkumulert fremført skattemessig underskudd
// FinnesProsjekterKey - 	Bruker firma tilvirkningskontrakter

export class AnnualSettlementWriteofDifferenceStep {

	busy = true;
	onDestroy$ = new Subject();
	annualSettlement: any;
	step = 1;
	completedSteps = 1;
	// validSteps = [true, true, true, false, false, false, false];

	infoContentArray = [
		{
			title: 'Eiendeler',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `
		},
		{
			title: 'Tilvirkningskontrakter',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `
		},
		{
			title: 'Varelager',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `
		},
		{
			title: 'Gevinst og tap',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `
		},
		{
			title: 'Skattemessig verdi på aksjer',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `
		},
		{
			title: 'Akkumulert fremført skattemessig underskudd',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnader til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere i år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `
		},
		{
			title: 'Oppsummering av endringer i forskjeller',
			text: ``
		}
	];

	infoContent: any = this.infoContentArray[0];

	contractTypes = [
		{ value: 1, label: 'Løpende avregning' },
		{ value: 2, label: 'Fullført kontraktsmetode' }
	];

	ct = { value: 0, label: '' };

	runningSettlementIncommingProject = null;
	runningSettlementOutgoingProject = null;
	runningSettlementYearStart = null;
	runningSettlementYearEnd = null;

	incommingProjects = null;
	outgoingProjects = null;
	diffs = [0, 0, 0, 0, 0, 0, 0];

	yearSelectConfig = {
		template: (item) => item.label,
		searchable: false,
		placeholder: 'Velg metode'
	};
	hasProjects = true;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private statisticsService: StatisticsService,
		private annualSettlementService: AnnualSettlementService,
		private changeDetector: ChangeDetectorRef,
		private errorService: ErrorService,
		private toastService: ToastService
	) {	}

	ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
			Observable.forkJoin([
				this.annualSettlementService.getAnnualSettlement(id),
				this.statisticsService.GetAllUnwrapped(`model=Project&select=count(ID) as count`)
			]).subscribe(([as, projectCount]) => {
				this.annualSettlement = as;

				debugger

				this.annualSettlement.Fields.FinnesProsjekterKey.Value =
					this.annualSettlement.Fields.FinnesProsjekterKey.Value === 'true';
				this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor.Value =
					this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor.Value === 'true';
				this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager.Value =
					this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager.Value === 'true';

				if (this.annualSettlement.Fields.FinnesProsjekterKey.Value) {
					if (!this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessigFjoraret.Value &&
						!this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessig.Value) {
							this.ct = this.contractTypes[1];
						} else {
							this.ct = this.contractTypes[0];
						}
				}

				this.hasProjects = projectCount[0].count > 0;
				this.changeDetector.markForCheck();
				this.busy = false;
			}, err => {
				this.errorService.handle(err);
				this.goBack();
			});
		});
	}

	onStep(direction: number) {
		if (direction > 0) {
			this.busy = true;
			this.checkSaveAndContinue(direction)
		} else {
			this.step += direction;
			this.setStepInfoContent();
		}
	}

	checkSaveAndContinue(direction: number) {

		if (this.step === 7 && direction > 0) {
			this.toastService.addToast('Informasjon lagret', ToastType.good, 6, 'Oppdatert informasjon på avskrivninger og forskjeller er lagret');
			this.goBack();
		}

		if (this.step === 2 && this.annualSettlement.Fields.FinnesProsjekterKey.Value) {
			if (this.ct.value === 2) {
				this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessigFjoraret.Value = null;
				this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessig.Value = null;
			}
		}

		if (this.step === 3) {
			if (!this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager.Value) {
				this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivning.Value = null;
				this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivning.Value = null;
				this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning.Value = null;
				this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivning.Value = null;
			}

			if (!this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor.Value) {
				this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret.Value = null;
				this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivningFjoraret.Value = null;
				this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret.Value = null;
				this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret.Value = null;
			}
		}

		this.annualSettlementService.updateAnnualSettlement(this.annualSettlement).subscribe(() => {
			this.step += direction;
			this.setStepInfoContent();
			this.recalc();
			this.busy = false;
		}, err => {
			this.busy = false;
		});
	}

	setStepInfoContent() {
		this.infoContent = this.infoContentArray[this.step - 1];
	}

	// This is called when a value on step 2 is changed
	recalc(step: number = this.step) {
		this.diffs[step - 1] = 0;

		if (this.step === 2) {
			if (this.ct.value === 1) {
				this.diffs[this.step - 1] = parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektFjoraret.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessigFjoraret.Value  || 0)
				+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektSkattemessig.Value  || 0);
			} else if (this.ct.value === 2) {
				this.diffs[this.step - 1] = parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntektFjoraret.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt.Value || 0);
			}
			// this.validSteps[1] = this.ct.value != 0;
		} else if (this.step === 3) {
			const thisYear = parseFloat(this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivning.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivning.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning.Value  || 0)
				+ parseFloat(this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivning.Value  || 0);

			const lastYear = parseFloat(this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivningFjoraret.Value || 0)
				+ parseFloat(this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret.Value  || 0)
				+ parseFloat(this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret.Value  || 0);

			this.diffs[2] = 0
				+ parseFloat(this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager.Value ? thisYear + '' : '0')
				+ parseFloat(this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor.Value ? lastYear + '' : '0');
		} else if (this.step === 4) {
			this.diffs[this.step - 1] = parseFloat(this.annualSettlement.Fields.GevinstTapskontoSaldoFjoraret.Value || 0);
		} else if (this.step === 5) {
			this.diffs[this.step - 1] = 0;
		} else if (this.step === 6) {
			this.diffs[this.step - 1] = parseFloat(this.annualSettlement.Fields.FremforbartUnderskudd.Value || 0);
		}
	}

	goBack() {
		this.router.navigateByUrl('/accounting/annual-settlement');
	}

}
