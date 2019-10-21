import {Eventplan, EventplanType} from '@app/unientities';

export interface FlowTemplate {
    TemplateName: string;
    MaterialIcon1: string;
    MaterialIcon2: string;
    Color?: string;
    Label: { no: string; en: string; };
    TemplateComment: { no: string; en: string; };
    Input?: FlowInput[];
    Eventplan: Eventplan;
}

export interface FlowInput {
    Name: string;
    Placeholder: string;
    Label: { no: string; en: string };
    Type: string;
    DefaultValue: string;
    Value?: any;
}

// tslint:disable:max-line-length
export const FLOW_TEMPLATES: FlowTemplate[] = [
    {
        TemplateName: 'AutomaticBankReconciliation',
        MaterialIcon1: 'payment',
        MaterialIcon2: 'done_all',
        Color: 'red',
        Label: {
            no: 'Automatisk bankavstemming',
            en: 'Automatic bank-reconciliation'
        },
        TemplateComment: {
            no: 'Automatisk bankavstemming ved mottak av kontoutskrift fra autobank',
            en: 'Automatic reconciliation at reception of autobank-reconciliation-files'
        },
        Input: [{
            Placeholder: '$AutoMatch',
            Name: 'automatch',
            Label: {
                no: 'Automatisk merking',
                en: 'Automatch'
            },
            Type: 'bool',
            DefaultValue: 'true'
        }, {
            Placeholder: '$maxdayoffset',
            Name: 'maxdayoffset',
            Label: {
                no: 'Maks antall dager avvik i dato',
                en: 'Number of days offset'
            },
            Type: 'integer',
            DefaultValue: '5'
        }, {
            Placeholder: '$AssignToEmail',
            Name: 'notify',
            Label: {
                no: 'Varsling til (epost)',
                en: 'Notify (email)'
            },
            Type: 'Email',
            DefaultValue: '@@user_email'
        }],
        Eventplan: <Eventplan>{
            Name: 'Automatisk bankavstemming',
            OperationFilter: 'C',
            ModelFilter: 'FileTag',
            PlanType: EventplanType.Custom,
            JobNames: 'ImportBankstatement',
        }
    }, {
        TemplateName: 'AutoAssignIncomingFiles',
        MaterialIcon1: 'attach_file',
        MaterialIcon2: 'thumb_up',
        Color: 'teal',
        Label: {
            no: 'Autotildeling av leverandørfaktura',
            en: 'Autoassign supplier-invoices'
        },
        TemplateComment: {
            no: 'Automatisk oppretting, tolkning, kontering og tildeling av inngående faktura',
            en: 'Automatic creation, classification and assignment of supplierinvoices'
        },
        Input: [{
            Placeholder: '$AssignToEmail',
            Name: 'Godkjenner',
            Label: {
                no: 'Tildeles til (epost)',
                en: 'Assign to (email)'
            },
            Type: 'Email',
            DefaultValue: '@@user_email'
        }, {
            Placeholder: '$FileFormats',
            Name: 'format',
            Label: {
                no: 'Filformater',
                en: 'Filetypes'
            },
            Type: 'string',
            DefaultValue: 'pdf,ehf,tif,png,jpg'
        }, {
            Placeholder: '$percent',
            Name: 'percent',
            Label: {
                no: 'Sannsynlighetsgrad før smart-kontering',
                en: 'Percent certainty before suggesting ledger account'
            },
            Type: 'integer',
            DefaultValue: '60'
        }, {
            Placeholder: '$sendmail',
            Name: 'sendmail',
            Label: {
                no: 'Send epost varsling',
                en: 'Send email reminder to assignee'
            },
            Type: 'bool',
            DefaultValue: 'true'
        }],
        Eventplan: <Eventplan>{
            Name: 'Automatisk tildeling av inngående faktura',
            OperationFilter: 'C',
            ModelFilter: 'FileTag',
            PlanType: EventplanType.Custom,
            JobNames: 'AssignFromFile',
        }
    },
    {
        TemplateName: 'SupplierSync',
        MaterialIcon1: 'perm_identity',
        MaterialIcon2: 'swap_vert',
        Color: 'sienna',
        Label: {
            no: 'Leverandørsynkronisering',
            en: 'Suppliersynchronization',
        },
        TemplateComment: {
            no: 'Synkronisering av leverandører mellom selskaper. Aktiveres bare på hovedselskapet. Kun leverandører med organisasjonsnummer blir synkronisert',
            en: 'Synchronizing suppliers between companies. Activate only on main-company. Only suppliers with org.number will be synchronized',
        },
        Input: null,
        Eventplan: <Eventplan>{
            Name: 'Leverandørsynkronisering',
            OperationFilter: 'CUD',
            ModelFilter: 'Supplier,SubCompany',
            PlanType: EventplanType.Custom,
            JobNames: 'SupplierSync',
        }
    },
    {
        TemplateName: 'BankChangeWarning',
        MaterialIcon1: 'attach_money',
        MaterialIcon2: 'warning',
        Color: '#e80',
        Label: {
            no: 'Bankkonto endringsvarsel',
            en: 'Bankaccount change-warning',
        },
        TemplateComment: {
            no: 'Sender epost-varsel dersom en bankkonto endres på en leverandør. Husk å sette opp epost-mottaker for varslingen.',
            en: 'Sends mail when a suppliers bankaccount changes. Remember to setup email-receiver for the warnings.',
        },
        Input: [{
            Placeholder: '$AssignToEmail',
            Name: 'Mottaker',
            Label: {
                no: 'Epost sendes til',
                en: 'Send email to'
            },
            Type: 'Email',
            DefaultValue: '@@user_email'
        }],
        Eventplan: <Eventplan>{
            Name: 'Varsel ved endring av bankkonto',
            OperationFilter: 'CUD',
            ModelFilter: 'Supplier,BankAccount',
            PlanType: EventplanType.Custom,
            JobNames: 'BankChange',
        }
    }
];
