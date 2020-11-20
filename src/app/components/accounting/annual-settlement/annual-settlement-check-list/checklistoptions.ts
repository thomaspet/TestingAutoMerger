export const infoOption = {
    title: 'Slik bruker du sjekklisten',
    text: 'Listen inneholder viktige sjekkpunkter du må se over, og eventuelt ordne opp i, før du kan begynne med avstemming av balansen. Hak av når du har fullført en oppgave.  Finnes det MVA-meldinger eller A-meldingsoppgaver som ikke er sendt inn, må dette håndteres før du kan gå videre. Når det er gjort vil systemet fjerne dem fra listen.',
    property: 'isVatReportOK'
};

export const options = [
    {// 1 - MVA
        title: 'En eller flere av dine MVA-meldinger er ikke fullført',
        text: `Det er viktig at alle terminer med MVA-melding er sendt inn og signert. <a href="#/accounting/vatreport">Gå til MVA-melding</a> her Dersom du mener at alt er korrekt kan du sjekke ut dette punktet.`,        property: 'IsMvaMeldingOK'
    },
    { // 2 - Lonn
        title: 'En eller flere av dine A-meldinger er ikke fullført',
        text: `Det er viktig at alle perioder med A-melding er sendt inn og tilbakemelding har status mottatt. <a href="#/salary/amelding?tabindex=0&periode=1">Gå til A-melding her</a> Dersom du mener at alt er korrekt kan du sjekke ut dette punktet.`,
        property: 'IsAmeldingOK'
    },
    { // 3 - Tidligere ar
        title: 'Regnskapet ditt for tidligere år balanserer ikke',
        text: `Det er viktig at dine tidligere år er avsluttet og balanserer. Bruk <a href="#/reports?category=Accounting">Saldobalanse hovedbok</a> for å finne ut hvor differansen ligger. Dersom du mener at alt er korrekt kan du sjekke ut dette punktet.`,
        property: 'AreAllPreviousYearsEndedAndBalances'
    },
    { // 4 - Aksjekapital
        title: 'Regnskapet ditt mangler  aksjekapital',
        text: `Vi finner ikke minst 30.000 kr i aksjekapital registrert i ditt regnskap. Legg inn denne verdien i <a href="#/accounting/journalentry/manual">Bokføring</a>. Dersom du mener at alt er korrekt kan du sjekke ut dette punktet.`,
        property: 'IsSharedCapitalOK'
    },
    { // 5 - Bilag fort
        title: 'Er alle bilag i året ført?',
        text: 'Det er viktig at du registrert alle bilag som tilhører året du skal sende inn årsoppgjør for er registrert i regnskapet.',
        property: 'IsAllJournalsDone'
    },
    { // 6 - Kundefaktura
        title: 'Har du fakturert alle salgsfaktura og registrert alle innbetaling 2020?',
        text: `<p>Gå til bankavstemming og avstem disse postene. Du kan velge å gå videre uten å avstemme, da vil du måtte forklare eventuelle differanser i selve avstemmingen av balansen.</p><p><a href="#/bank/reconciliation?tabIndex=0">Gå til bankavstemming her</a></p>`,
        property: 'IsAllCustomersInvoicesPaid'
    },
    { // 7 - Leverandorfaktura
        title: 'Er alle regninger og kvitteringer lastet opp og bokført i regnskapet',
        text: 'Har du registrert alle regninger som du har mottatt i 2020? Har du bokført utbetalinger for 2020? Alle regninger som er mottatt i 2020 må bokføres og utbetalinger registreres i systemet.',
        property: 'IsAllSupplierInvoicesPaid'
    },
    { // 8 - Varelager
        title: 'Er det bokført nedskrivninger av varer som fortsatt er på lager i år?',
        text: 'Text has to be added.'
    },
    { // 9 - Eiendeler
        title: 'Summen av eiendeler stemmer ikke med summen av balansekontoer for eiendeler i regnskapet',
        text: `Det er viktig at summen du har registrert på dine eiendeler stemmer overens med summen av balansekontoene for eiendeler i regnskapet. <a href="#/accounting/assets">Gå til Eiendeler</a> her Dersom du mener at alt er korrekt kan du sjekke ut dette punktet.`
    }
];

