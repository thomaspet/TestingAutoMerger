
export const billViewLanguage = {
    btn_yes: 'Ja',
    btn_no: 'Nei',

    tab_invoice: 'Faktura',
    tab_document: 'Dokument',
    tab_journal: 'Bilagslinjer',
    tab_items: 'Varelinjer',
    tab_history: 'Historikk',

    title_new: 'Fakturamottak (nytt)',
    title_with_id: 'Fakturamottak #',

    headliner_new: 'Nytt fakturamottak',
    headliner_invoice: 'Fakturanr.',
    headliner_supplier: 'Lev.nr.',
    headliner_journal: 'Bilagsnr.',
    headliner_journal_not: 'ikke bokført',

    col_supplier: 'Leverandør',
    col_invoice: 'Fakturanr.',
    col_total: 'Fakturabeløp',
    col_date: 'Fakturadato',
    col_due: 'Forfallsdato',
    col_kid: 'KID',
    col_bank: 'Bankkonto',
    col_currency_code: 'Valuta',

    tool_save: 'Lagre endringer',
    tool_save_and_new: 'Lagre og start ny',
    tool_delete: 'Slett',
    tool_save_and_reject: 'Lagre og avvis',
    save_error: 'Feil ved lagring',
    save_success: 'Lagret',
    assign_success: 'Tildelt',
    reAssign_success: 'Klar til å tildele på nytt',

    delete_nothing_todo: 'Ingenting å slette',
    delete_error: 'Feil ved sletting',
    delete_success: 'Sletting ok',

    btn_new_supplier: 'Ny',
    add_image_now: 'Trykk på "pluss" knappen for å legge til nytt dokument',

    journaled_ok: 'Bokføring fullført',
    payment_ok: 'Betaling registrert',
    ready_for_payment: 'Status endret til "Klar for betaling"',

    err_missing_journalEntries: 'Kontering mangler!',
    err_diff: 'Differanse i posteringer!',
    err_supplieraccount_not_found: 'Fant ikke leverandørkonto!',
    err_journal: 'Bokføring feilet',

    ask_archive: 'Arkivere faktura ',
    ask_journal_msg: 'Bokføre fakturamottak med beløp ',
    ask_journal_title: 'Bokføre fakturamottak fra ',
    ask_approve_and_journal_title: 'Godkjenne og bokføre fakturamottak fra ',
    ask_approve_and_journal_and_topayment_title: 'Godkjenne, bokføre og til betaling av fakturamottak fra ',
    ask_journal_and_topayment_title: 'Bokføre og til betaling av fakturamottak fra ',
    ask_register_payment: 'Registrere betaling for leverandør-faktura: ',
    ask_register_payment_for_outgoing_payment: 'Legg til i betalingsliste for leverandør-faktura: ',
    warning_action_not_reversable: 'Merk! Dette steget er det ikke mulig å reversere.',

    ask_delete: 'Vil du virkelig slette faktura ',
    delete_canceled: 'Sletting avbrutt',

    converter: 'Kjør tolk (OCR/EHF)',

    ocr_running: 'Kjører OCR-tolkning av dokumentet og leter etter gjenkjennbare verdier. Vent litt..',
    org_not_found: '(aktuelt orgnr. ble ikke funnet blant dine eksisterende leverandører)',
    create_supplier: 'Opprette ny leverandør',
    org_number: 'Organisasjonsnr.',

    ehf_running: 'Kjører EHF-tolkning av dokumentet. Vent litt..',

    create_bankaccount_accept: 'Opprett konto',
    create_bankaccount_reject: 'Ikke opprett konto',
    create_bankaccount_title: 'Vil du opprette bankkonto',
    create_bankaccount_info: 'Kontonr er ikke registrert på leverandøren',
    create_bankaccount_bban: 'BBAN',
    create_bankaccount_iban: 'IBAN',

    warning: 'Advarsel',
    fyi: 'Til informasjon',

    task_approval: 'Godkjenning',
    task_approve: 'Godkjenn',
    task_reject: 'Avvis',
    task_approve_and_journal: 'Godkjenn og bokfør',
    task_approve_and_journal_and_topayment: 'Godkjenn, Bokfør og Til betaling',
    task_journal_and_topayment: 'Bokfør og Til betaling',

    err_missing_comment: 'Du må skrive en kommentar som forklarer avvisningen.'

};

export const approvalStatusLabels = {
    50120: 'Tildelt',
    50130: 'Godkjent',
    50140: 'Avvist'
};

export const billStatusflowLabels = {
    'smartbooking': 'Foreslå kontering',
    'journal': 'Bokfør',

    'payInvoice': 'Sett betalt beløp',
    'sendForPayment': 'Til Betalingsliste',
    'pay': 'Sett til betalt',

    'assign': 'Tildel',
    'cancelApprovement': 'Tilbakestill',
    'reAssign': 'Tildel på nytt',
    'approve': 'Godkjenn',
    'rejectInvoice': 'Avvis faktura',
    'rejectAssignment': 'Avvis tildeling',
    'restore': 'Gjenopprett',

    'finish': 'Arkiver'
};
