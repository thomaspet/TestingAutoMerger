import {ChangeDetectorRef, Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService, StatisticsService } from '@app/services/services';
import { BusinessRelation } from '@uni-entities';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { UniModalService } from '@uni-framework/uni-modal';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AnnualSettlementService } from '../annual-settlement.service';
import {AssetsEditModal} from './assets-edit-modal';

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
	step = 0;

	sumLineStep1 = { sumIn: 0, sumOut: 0, change: 0 };
	sumLine: any = {};
	tableConfig: UniTableConfig;

	summaryArray = [];

	onlySumFields = [{
		title: 'Utestående fordringer', text: '', diff: 0, step: 11,
	},
	{
		title: 'Uopptjent inntekt', text: '', diff: 0, step: 12,
	},
	{
		title: 'Avsetning for forpliktelser', text: '', diff: 0, step: 13,
	},
	{
		title: 'Inntektsført avsatt utbytte fra datterselskap og tilknyttet selskap', text: '', diff: 0, step: 14,
	}];

	inventoryFields = [
		{ 
			label: 'Råvarer og innkjøpte halvfabrikata', 
			field: 'LagerbeholdningRavarerHalvfabrikataNedskrivning', 
			fieldLastYear: 'LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret', 
			visible: true 
		},
		{ 
			label: 'Varer under tilvirkning', 
			field: 'LagerbeholdningVarerIArbeidNedskrivning', 
			fieldLastYear: 'LagerbeholdningVarerIArbeidNedskrivningFjoraret', 
			visible: true
		},
		{ 
			label: 'Ferdige egentilvirkede varer', 
			field: 'LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning', 
			fieldLastYear: 'LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret', 
			visible: true
		},
		{ 
			label: 'Innkjøpte varer for videresalg', 
			field: 'LagerbeholdningInnkjopteVarerVideresalgNedskrivning', 
			fieldLastYear: 'LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret', 
			visible: true
		}
	]

	stepContentArray = [
		{
			title: 'Eiendeler',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 0
		},
		{
			title: 'Tilvirkningskontrakter',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 1
		},
		{
			title: 'Varelager',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 2
		},
		{
			title: 'Gevinst og tap',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 3
		},
		{
			title: 'Skattemessig verdi på aksjer',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 4
		},
		{
			title: 'Akkumulert fremført skattemessig underskudd',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 5
		},
		{
			title: 'Coronapakke for firma med underskudd 2020',
			text: ` <p>
				Endringer i forskjeller mellom regnskapsmessige og skattemessige verdier påvirker skattekostnaden til selskapet via utsatt skattefordel/utsatt skattegjeld. Dersom du har levert ligningsoppgave tidligere år
				på dette firmaet, anbefaler vi deg å bruke RF-1217 til hjelp i utfylling her </p> `,
			diff: 0,
			step: 6,
			summaryTitle: 'Sum positiv alminnelig inntekt'
		},
		{
			title: 'Oppsummering av endringer i forskjeller',
			text: ``,
			diff: 0,
			step: 7,
			summaryTitle: 'Endring i grunnlag for utsatt skatt/utsatt skattefordel'
		}
	];

	infoContent: any = this.stepContentArray[0];

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

	groups = [];
	missingTaxData = true;

	assetsDetails = [];

	stockAccounts = [];

	yearSelectConfig = {
		template: (item) => item.label,
		searchable: false,
		placeholder: 'Velg metode'
	};

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private statisticsService: StatisticsService,
		private annualSettlementService: AnnualSettlementService,
		private changeDetector: ChangeDetectorRef,
		private errorService: ErrorService,
		private toastService: ToastService,
		private modalService: UniModalService
	) {	}

	ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
			Observable.forkJoin([
				this.annualSettlementService.getAnnualSettlement(id),
				this.statisticsService.GetAllUnwrapped(`model=Project&select=count(ID) as count`),

				this.annualSettlementService.getAccountBalanceForSet(1400, 1419, new Date().getFullYear() - 1),
				this.annualSettlementService.getAccountBalanceForSet(1420, 1439, new Date().getFullYear() - 1),
				this.annualSettlementService.getAccountBalanceForSet(1440, 1459, new Date().getFullYear() - 1),
				this.annualSettlementService.getAccountBalanceForSet(1460, 1489, new Date().getFullYear() - 1),

				this.annualSettlementService.getAssetTaxbasedIBDetails(id),
				this.annualSettlementService.getStockAccountsIBAndUB(),
				this.annualSettlementService.getAssetAndGroups(id),
				this.annualSettlementService.getResult(id)
			]).subscribe(([as, projectCount, balance1, balance2, balance3, balance4, details, stockAccounts, groups, result]) => {
				this.annualSettlement = as;
				this.assetsDetails = this.getFormattedDetailsData(details);

				if (stockAccounts.length) {
					this.stockAccounts = stockAccounts.map(account => {
						account._taxIB = account.IB;
						account._taxUB = account.UB;
						return account;
					});
	
					this.stockAccounts.push({});
					this.recalcTaxSums();

					this.setUpTable();
				} else {
					const index = this.stepContentArray.findIndex(step => step.step === 4);
					this.stepContentArray.splice(index, 1);
				}

				this.groups = groups;

				this.checkMissingTaxData();

				this.annualSettlement.Fields.FinnesProsjekterKey =
					this.annualSettlement.Fields.FinnesProsjekterKey === 'true';
				this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor =
					this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor === 'true';
				this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager =
					this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager === 'true';

				// Set diffs from the annual settlement object
				this.onlySumFields[0].diff = parseFloat(this.annualSettlement.Fields.ForskjellerFordringer);
				this.onlySumFields[1].diff = parseFloat(this.annualSettlement.Fields.DriftsinntekterUopptjent );
				this.onlySumFields[2].diff = parseFloat(this.annualSettlement.Fields.AvsetningerForpliktelser );
				this.onlySumFields[3].diff = parseFloat(this.annualSettlement.Fields.UtbytteDatterTilknyttetSelskapInntektsfort );

				if (this.annualSettlement.Fields.FinnesProsjekterKey) {
					if (!this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt) {
						this.ct = this.contractTypes[1];
					} else {
						this.ct = this.contractTypes[0];
					}
				}

				if (projectCount[0].count <= 0) {
					const index = this.stepContentArray.findIndex(step => step.step === 1);
					this.stepContentArray.splice(index, 1);
				}

				if (!parseFloat(balance1) && !parseFloat(balance2) && !parseFloat(balance3) && !parseFloat(balance4)) {
					const index = this.stepContentArray.findIndex(step => step.step === 2);
					this.stepContentArray.splice(index, 1);
				} else {
					this.inventoryFields[0].visible = !!parseFloat(balance1);
					this.inventoryFields[1].visible = !!parseFloat(balance2);
					this.inventoryFields[2].visible = !!parseFloat(balance3);
					this.inventoryFields[3].visible = !!parseFloat(balance4);

					this.inventoryFields = this.inventoryFields.filter(f => f.visible);
				}

				// Corona feedback
				if (parseFloat(result) < 0) {
					const index = this.stepContentArray.findIndex(step => step.step === 6);
					this.stepContentArray.splice(index, 1);
				}

				this.summaryArray = [...this.stepContentArray];
				this.summaryArray.splice(this.summaryArray.length - 2, 0, ...this.onlySumFields);
				
				this.recalc();

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

	getFormattedDetailsData(data: any[]): any[] {
		if (!data.length) {
			return [];
		}

		this.sumLine = {
			Value: data.map(a => a.Value || 0).reduce((a, b) => (a || 0) + (b || 0)),
			Movement: data.map(a => a.Movement || 0).reduce((a, b) => (a || 0) + (b || 0)),
			TaxbasedDepreciation: data.map(a => a.TaxbasedDepreciation || 0).reduce((a, b) => (a || 0) + (b || 0)),
			TaxBasedUB: data.map(a => a.TaxBasedUB || 0).reduce((a, b) => (a || 0) + (b || 0))
		}

		return data.sort((a, b) => { return a.GroupCode > b.GroupCode ? 1 : -1 });
	}

	checkMissingTaxData() {
		// REMOVE COMMENT WHEN FIXED
		// this.missingTaxData = !!this.groups.filter(g => !g.Value || !g.ID).length;
		this.missingTaxData = false;
	}

	openEditModal() {
		this.modalService.open(AssetsEditModal, { data: { groups: this.groups } }).onClose.subscribe((hasSavedChanges: boolean) => {
			if (hasSavedChanges) {
				this.busy = true;
				Observable.forkJoin([
					this.annualSettlementService.getAssetTaxbasedIBDetails(this.annualSettlement.ID),
					this.annualSettlementService.getAssetAndGroups(this.annualSettlement.ID),
					this.annualSettlementService.getAnnualSettlement(this.annualSettlement.ID),
				]).subscribe(([data, groups, as]) => {
					this.assetsDetails = this.getFormattedDetailsData(data);
					this.groups = groups;
					this.annualSettlement = as;
					this.recalc();
					this.checkMissingTaxData();
					this.toastService.addToast('Lagret', ToastType.good, 5, 'Oppdateringer på inngående skattemessig verdi på dine eiendeler ble lagret.');
					this.busy = false;
				}, err => {
					this.errorService.handle(err);
					this.toastService.addToast('Lagret, men kunne ikke hente data på nytt', ToastType.warn, 5, 
						'Oppdateringer på inngående skattemessig verdi på dine eiendeler ble lagret, men noe gikk galt da vi skulle hente oppdatert data. Prøv å oppdater bilde, eller gå tilbake il oversikten og start igjen');
					this.busy = false;
				})

			}
		})
	}

	setUpTable() {
        this.tableConfig = new UniTableConfig('acconting.annualsettlement.editstockaccounts', true, false, 20)
        .setAutoAddNewRow(false)
        .setColumns([
            new UniTableColumn('AccountNumber', 'Konto', UniTableColumnType.Text).setEditable(false).setAlignment('center'),
            new UniTableColumn('AccountName', 'Navn', UniTableColumnType.Text).setEditable(false),
			new UniTableColumn('IB', 'Regnskapsmessig IB', UniTableColumnType.Money).setEditable(false),
			new UniTableColumn('UB', 'Regnskapsmessig UB', UniTableColumnType.Money).setEditable(false),
			new UniTableColumn('_taxIB', 'Skattemessig IB', UniTableColumnType.Money),
			new UniTableColumn('_taxUB', 'Skattemessig UB', UniTableColumnType.Money)])
		.setChangeCallback((event) => {
			this.stockAccounts[event.originalIndex] = event.rowModel;
			this.recalcTaxSums();
		})
		.setIsRowReadOnly((row) => row._name === 'SUMLINEROW')
		.setConditionalRowCls((row) => row._name === 'SUMLINEROW' ? 'sum-line-background' : '');
	}
	
	recalcTaxSums() {

		this.stockAccounts.pop();

		this.annualSettlement.Fields.AksjerMvFjoraret = 0;
		this.annualSettlement.Fields.AksjerMv = 0;
		this.annualSettlement.Fields.AksjerMvSkattemessigVerdiFjoraret = 0;
		this.annualSettlement.Fields.AksjerMvSkattemessigVerdi = 0;

		this.stockAccounts.forEach((account) => {
			this.annualSettlement.Fields.AksjerMvFjoraret += account.IB;
			this.annualSettlement.Fields.AksjerMv += account.UB;
			this.annualSettlement.Fields.AksjerMvSkattemessigVerdiFjoraret += account._taxIB;
			this.annualSettlement.Fields.AksjerMvSkattemessigVerdi  += account._taxUB;	
		})

		this.stockAccounts.push({
			AccountNumber: null,
			AccountName: '',
			IB: this.annualSettlement.Fields.AksjerMvFjoraret,
			UB: this.annualSettlement.Fields.AksjerMv,
			_taxIB: this.annualSettlement.Fields.AksjerMvSkattemessigVerdiFjoraret,
			_taxUB: this.annualSettlement.Fields.AksjerMvSkattemessigVerdi,
			_name: 'SUMLINEROW'
		});

		if (this.infoContent.step === 4) {
			this.infoContent.diff = (parseFloat(this.annualSettlement.Fields.AksjerMvFjoraret || 0) - parseFloat(this.annualSettlement.Fields.AksjerMvSkattemessigVerdiFjoraret || 0) - 
			(parseFloat(this.annualSettlement.Fields.AksjerMv || 0) - parseFloat(this.annualSettlement.Fields.AksjerMvSkattemessigVerdi || 0)));
		}
		this.stockAccounts = [...this.stockAccounts];
	}

	checkSaveAndContinue(direction: number) {

		if (this.infoContent.step === 7 && direction > 0) {
			this.annualSettlementService.moveFromStep3ToStep4(this.annualSettlement).subscribe(() => {
				this.toastService.addToast('Informasjon lagret', ToastType.good, 6, 'Oppdatert informasjon på avskrivninger og forskjeller er lagret');
				this.goBack();
				return;
			}, err => {
				this.toastService.addToast('Informasjon lagret, men noe gikk galt', ToastType.bad, 6, 'Klarte ikke fullføre steg 3. Se gjennom data og prøv igjen');
				this.goBack();
				return;
			});
		} else {
			if (this.infoContent.step === 1 && this.annualSettlement.Fields.FinnesProsjekterKey) {
				if (this.ct.value === 2) {
					this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt = null;
				}
			}
	
			if (this.infoContent.step === 2) {
				if (!this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager) {
					this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivning = null;
					this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivning = null;
					this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning = null;
					this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivning = null;
				}
	
				if (!this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor) {
					this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret = null;
					this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivningFjoraret = null;
					this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret = null;
					this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret = null;
				}
			}
	
			this.annualSettlementService.updateAnnualSettlement(this.annualSettlement).subscribe(() => {
				this.step += direction;
				this.setStepInfoContent();
				this.busy = false;
			}, err => {
				this.busy = false;
			});
		}
	}

	setStepInfoContent() {
		this.infoContent = this.stepContentArray[this.step];
		this.recalc();
	}

	recalc() {
		this.infoContent.diff = 0;

		switch (this.infoContent.step) {
			case 0:
				this.sumLineStep1.sumIn = parseFloat(this.annualSettlement.Fields.DriftsmidlerFjoraret || 0) - parseFloat(this.annualSettlement.Fields.DriftsmidlerSkattemessigFjoraret || 0);
				this.sumLineStep1.sumOut = parseFloat(this.annualSettlement.Fields.Driftsmidler || 0) - parseFloat(this.annualSettlement.Fields.DriftsmidlerSkattemessig || 0);;
				this.sumLineStep1.change = this.sumLineStep1.sumIn - this.sumLineStep1.sumOut;
				this.infoContent.diff = this.sumLineStep1.change;
				break;
			case 1:
				if (this.ct.value === 1) {
					this.infoContent.diff = parseFloat(this.annualSettlement.Fields.TilvirkningskontraktOpptjentInntekt || 0);
				} else if (this.ct.value === 2) {
					this.infoContent.diff = 0;
				}
				break;

			case 2:
				const thisYear = parseFloat(this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivning || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivning || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivning  || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivning  || 0);

				const lastYear = parseFloat(this.annualSettlement.Fields.LagerbeholdningRavarerHalvfabrikataNedskrivningFjoraret || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningVarerIArbeidNedskrivningFjoraret || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningFerdigEgentilvirkedeVarerNedskrivningFjoraret  || 0)
					+ parseFloat(this.annualSettlement.Fields.LagerbeholdningInnkjopteVarerVideresalgNedskrivningFjoraret  || 0);

					this.infoContent.diff = 0
					+ parseFloat(this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLager ? thisYear + '' : '0')
					- parseFloat(this.annualSettlement.Fields.ErDetBokfortNedskrivingerAvVarerPaLagerIFjor ? lastYear + '' : '0');

				break;
			
			case 3:
				this.infoContent.diff = parseFloat(this.annualSettlement.Fields.GevinstTapskontoSaldoFjoraret || 0);
				break;
			case 4:
				this.recalcTaxSums();
				break;
			case 5: 
				this.infoContent.diff = parseFloat(this.annualSettlement.Fields.FremforbartUnderskudd || 0);
				break;
			case 6: 
				const twoYearsAgo = parseFloat(this.annualSettlement.Fields.CompanyProfit2018 || 0) > 0 ? parseFloat(this.annualSettlement.Fields.CompanyProfit2018 || 0) : 0;
				const oneYearAgo = parseFloat(this.annualSettlement.Fields.CompanyProfit2019 || 0) > 0 ? parseFloat(this.annualSettlement.Fields.CompanyProfit2019 || 0) : 0;
				this.infoContent.diff = twoYearsAgo + oneYearAgo;
				break;
		}

		this.stepContentArray[this.stepContentArray.length - 1].diff = this.stepContentArray
			.map((step) => {
				if (step.step !== 7) {
					return step.diff;
				} 
			}).reduce((accumulator, currentValue) => (accumulator || 0) + (currentValue || 0));
	}

	goBack() {
		this.router.navigateByUrl('/accounting/annual-settlement');
	}

}
