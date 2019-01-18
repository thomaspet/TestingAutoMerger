import {Eventplan, EventplanType} from '@app/unientities';
export interface FlowTemplateInterface {
    TemplateName: string;
    MaterialIcon1: string;
    MaterialIcon2: string;
    Label: {
        no: string;
        en: string;
    },
    TemplateComment: {
        no: string;
        en: string;
    },
    Input?: FlowInput[],
    Eventplan: Eventplan,
}
export interface Label {
    no: string;
    en: string;
}

export interface FlowInput {
    Name: string;
    Placeholder: string;
    Label: Label;
    Type: string;
    DefaultValue: string;
    Value?: any;
}

export const templates: FlowTemplateInterface[] = [
    {
        TemplateName: "AutoAssignIncomingFiles",
        MaterialIcon1: "query_builder",
        MaterialIcon2: "question_answer",
        Label: {
            no: "Dokumentflyt",
            en: "Document flow"
        },
        TemplateComment: {
            no: "Automatisk oppretting, tolkning, kontering og tildeling av inngående faktura",
            en: "Automatic creation, classification and assignment of supplierinvoices"
        },
        Input: [{
            Placeholder: "$AssignToEmail",
            Name: "Godkjenner",
            Label: {
                no: "Tildeles til (epost)",
                en: "Assign to (email)"
            },
            Type: "Email",
            DefaultValue: "@@user_email"
        }, {
            Placeholder: "$FileFormats",
            Name: "format",
            Label: {
                no: "Filformater",
                en: "Filetypes"
            },
            Type: "string",
            DefaultValue: "pdf,ehf,tif,png,jpg"
        }, {
            Placeholder: "$percent",
            Name: "percent",
            Label: {
                no: "Sannsynlighetsgrad før smart-kontering",
                en: "Percent certainty before suggesting ledger account"
            },
            Type: "integer",
            DefaultValue: "60"
        }],
        Eventplan: <Eventplan>{
            Name: "Automatisk tildeling av inngående faktura",
            OperationFilter: "C",
            ModelFilter: "FileTag",
            PlanType: EventplanType.Custom,
            JobNames: "AssignFromFile",
        }
    },
    {
        TemplateName: "SupplierSync",
        MaterialIcon1: "perm_media",
        MaterialIcon2: "perm_identity",
        Label: {
            no: "Synkronisering av leverandører mellom selskaper",
            en: "Synchronizing suppliers between companies",
        },
        TemplateComment: {
            no: "Aktiveres bare på hovedselskapet. Kun leverandører med organisasjonsnummer blir synkronisert",
            en: "Activate only on main-company. Only suppliers with org.number will be synchronized",
        },
        Input: null,
        Eventplan: <Eventplan>{
            Name: "Leverandørsynkronisering",
            OperationFilter: "CUD",
            ModelFilter: "Supplier",
            PlanType: EventplanType.Custom,
            JobNames: "SupplierSync",
        }
    }
];
