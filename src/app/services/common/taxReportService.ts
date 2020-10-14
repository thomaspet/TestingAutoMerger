import { Injectable } from '@angular/core';
import { UniHttp } from '@uni-framework/core/http/http';
import { UniEntity } from '@uni-entities';
import { BizHttp } from '@uni-framework/core/http';
import {Observable} from 'rxjs';

export class TaxReport extends UniEntity {
    public static RelativeUrl = 'taxreport';
    public static EntityType = 'TaxReport';

    public ID: number;
    public Year: number;
    public Data: string;
    public Code: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Records: { Key: string, record: FormRecord}[];
}
export class FormRecord {
    public Type: string;
    public Text: string;
    public Value: string;
    public Verified: boolean;
    public ReadOnly: boolean;

    constructor(text?: string, verified: boolean = true) {
        this.Text = text || '';
        this.Verified = verified;
    }
}
export class FormRecordWithKey extends FormRecord {
    public Key: string;

    constructor(key: string, text?: string, value?: string, verified: boolean = false) {
        super();
        this.Key = key;
        this.Text = text || '';
        this.Value = value || '';
        this.Verified = verified;
    }
}

export class Schema {
    private _records: FormRecordWithKey[] = [];
    public GetRecords(): FormRecordWithKey[] {
        return this._records;
    }
    constructor(code: string) {
        // TODO get from json-file or similar
        if (code === 'RF-1167') {
            // Side 1
            this._records.push(new FormRecordWithKey('Revisjonsplikt', 'Er foretaket revisjonspliktig?')); // Ja/Nei/Valgt bort
            this._records.push(new FormRecordWithKey('ArsregnskapRegnskapsregler', 'Hvilke regler er benyttet ved utarbeidelse av årsregnskapet?'));
              // fem valg: IFRS; Regnskapslovens regler for små foretak; Forenklet IFRS; God regnskapsskikk for ideelle organisasjoner; Regnskapslovens alminnelige regler.
            this._records.push(new FormRecordWithKey('ValutaUtenlandsk', 'Er bokføringsvalutaen en annen enn norske kroner, jf.  bokføringsforskriften § 4-2?')); // Ja/Nei
            this._records.push(new FormRecordWithKey('ValutaTypeSpesifisertValuta', 'Type valuta'));
            this._records.push(new FormRecordWithKey('Regnskapsplikt', 'Har foretaket årsregnskapsplikt etter regnskapsloven?'));
            this._records.push(new FormRecordWithKey('RevisorOrganisasjonsnummer', 'Revisors organisasjonsnr.'));
            this._records.push(new FormRecordWithKey('RevisjonsselskapNavn', 'Revisorselskapets navn'));
            this._records.push(new FormRecordWithKey('RevisorNavn', 'Revisors navn'));
            this._records.push(new FormRecordWithKey('RevisorAdresse', 'Adresse'));
            this._records.push(new FormRecordWithKey('RevisorPostnummer', 'Postnr.'));
            this._records.push(new FormRecordWithKey('RevisorPoststed', 'Poststed'));
            this._records.push(new FormRecordWithKey('RegnskapsforingEkstern', 'Er den løpende bokføringen utført av ekstern regnskapsfører?')); // Ja/Nei
            this._records.push(new FormRecordWithKey('RegnskapsforerNavn', 'Navn'));
            this._records.push(new FormRecordWithKey('RegnskapsforerOrganisasjonsnummer', 'Organisasjonsnr.'));
            this._records.push(new FormRecordWithKey('RegnskapsforerAdresse', 'Forretningsadresse'));
            this._records.push(new FormRecordWithKey('RegnskapsforerPostnummer', 'Postnummer og poststed'));
            this._records.push(new FormRecordWithKey('RegnskapsforerPoststed', 'Poststed i adressen til regnskapsfører'));
            this._records.push(new FormRecordWithKey('UtfyllerNaringsoppgave', 'Hvem har fylt ut næringsoppgaven?')); // Valgt revisor/ekstern regnskapsfører; foretaket selv; annen - oppgi hvem.
            this._records.push(new FormRecordWithKey('UtfyllerOrganisasjonsnummer', 'Organisasjonsnummer'));
            this._records.push(new FormRecordWithKey('UtfyllerNavn', 'Navn'));
            this._records.push(new FormRecordWithKey('UtfyllerPostnummer', 'Postnummer'));
            this._records.push(new FormRecordWithKey('UtfyllerPoststed', 'Poststed'));
            this._records.push(new FormRecordWithKey('FremforbartUnderskudd', 'Fremførbart underskudd'));
            this._records.push(new FormRecordWithKey('Sysselsatte', 'Antall årsverk i regnskapsåret'));
            // Varelager
            this._records.push(new FormRecordWithKey('LagerbeholdningRavarerHalvfabrikata', 'Råvarer og innkjøpte halvfabrikata'));
            this._records.push(new FormRecordWithKey('LagerbeholdningRavarerHalvfabrikataFjoraret', 'Råvarer og innkjøpte halvfabrikata i fjor'));
            this._records.push(new FormRecordWithKey('LagerbeholdningVarerIArbeid', 'Varer under tilvirkning'));
            this._records.push(new FormRecordWithKey('LagerbeholdningVarerIArbeidFjoraret', 'Varer under tilvirkning i fjor'));
            this._records.push(new FormRecordWithKey('LagerbeholdningFerdigEgentilvirkedeVarer', 'Ferdige egentilvirkede varer'));
            this._records.push(new FormRecordWithKey('LagerbeholdningFerdigEgentilvirkedeVarerFjoraret', 'Ferdige egentilvirkede varer i fjor'));
            this._records.push(new FormRecordWithKey('LagerbeholdningInnkjopteVarerVideresalg', 'Innkjøpte varer for videresalg'));
            this._records.push(new FormRecordWithKey('LagerbeholdningInnkjopteVarerVideresalgFjoraret', 'Innkjøpte varer for videresalg i fjor'));
            this._records.push(new FormRecordWithKey('SalgKreditt', 'Kredittsalg'));
            this._records.push(new FormRecordWithKey('SalgKredittFjoraret', 'Kredittsalg i fjor'));
            // Side 4 - beløp
            this._records.push(new FormRecordWithKey('AndelDeltakerlignetSelskapTap', 'Regnskapsmessig tap ved realisasjon av andel i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('GjeldsrenterTilbakefortEtter2392Og691', 'Tilbakeførte gjeldsrenter etter sktl §§ 2-39 (2) og 6-91'));
            this._records.push(new FormRecordWithKey('OverskuddAndelDeltakerlignetSelskapSkattemessig', 'Skattemessig overskudd på andel i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('AndelDeltakerlignetSelskapGevinstSkattemessig', 'Skattepliktig gevinst ved realisasjon av andel i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('Rentekostnader', 'Rentekostnader ført i resultatregnskapet'));
            this._records.push(new FormRecordWithKey('UtbytteEgenkapitalmetoden', 'Korreksjon for foreslått utbytte fra DS og TS ved bruk av egenkapitalmetoden. (kun skattepliktig utbytte)'));
            this._records.push(new FormRecordWithKey('GevinstUttakEiendelerSkattepliktig', 'Skattepliktig gevinst fra RF-1109'));
            this._records.push(new FormRecordWithKey('InntektAnnen', 'Andre inntekter'));
            this._records.push(new FormRecordWithKey('AnleggsmidlerNedskrivningReversering', 'Reversering av tidligere nedskrivning på aksjer og andre verdipapir inntektsført i året'));
            this._records.push(new FormRecordWithKey('OverskuddAndelDeltakerlignetSelskap', 'Andel av regnskapsmessig overskudd i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('AndelDeltakerlignetSelskapGevinst', 'Regnskapsmessig gevinst ved realisasjon av andel i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('InntekterSkattefrieFradrag', 'Andre skattefrie inntekter'));
            this._records.push(new FormRecordWithKey('UnderskuddAndelDeltakerlignetSelskapSkattemessig', 'Skattemessig underskudd på andel i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('AndelDeltakerlignetSelskapTapSkattemessig', 'Fradragsberettiget tap ved realisasjon av andel i selskap med deltakerfastsetting'));
            this._records.push(new FormRecordWithKey('TapUttakEiendelerFradragsberettiget', 'Fradragsberettiget tap fra RF-1109'));
            this._records.push(new FormRecordWithKey('KostnaderEmisjonStiftelse', 'Emisjons- og stiftelseskostnader'));
            this._records.push(new FormRecordWithKey('NaringsinntektFradragAnnet', 'Andre fradrag'));
        }
    }
}
export class SchemaRF1167 {
    public Revisjonsplikt: string;
}
export class NameKey {
    public Key: string;
    public Name: string;

    constructor(key: string, name?: string) {
        this.Key = key || '';
        this.Name = name || key;
    }
}

@Injectable()
export class TaxReportService extends BizHttp<TaxReport> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TaxReport.RelativeUrl;
        this.entityType = TaxReport.EntityType;
    }

    public GetOrCreateTaxReport(): Observable<TaxReport> {
        // TODO year. Skal det velges av bruker, være likt året man jobber med, eller?
        return super.PostAction(null, 'get-or-create', 'year=2020&code=RF-1167');
    }

    public GetTaxReport(id: number): Observable<TaxReport> {
        return super.Get(id);
    }

    public SaveTaxReport(taxReport: TaxReport): Observable<TaxReport> {
        return super.Put(taxReport.ID, taxReport);
    }

    public SendTaxReport(id: number) {
        super.PutAction(null, 'send', 'ID=' + id).subscribe(() => {
            // this action does not return anything yet
        });
    }

    public getRecords(taxReport: TaxReport): FormRecordWithKey[] {
        const taxRecords: FormRecordWithKey[] = [];
        const data = JSON.parse(taxReport.Data);

        const schema = new Schema('RF-1167');
        const records = schema.GetRecords();
        records.forEach((record) => {
            const item: FormRecord = data[record.Key];
            taxRecords.push(new FormRecordWithKey(record.Key, record.Text, item.Value, item.Verified));
        });
        return taxRecords;
    }
}
