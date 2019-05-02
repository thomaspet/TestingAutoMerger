import {EHFData, EHFAttachment} from './ehf-model';
import {get} from 'lodash';
import {toByteArray } from 'base64-js';
import * as moment from 'moment';

export function parseEHFData(data) {
    let invoiceData;
    let isCreditNote;

    if (data.StandardBusinessDocument) {
        isCreditNote = !!data.StandardBusinessDocument.CreditNote;
        invoiceData = data.StandardBusinessDocument.Invoice || data.StandardBusinessDocument.CreditNote;
    } else {
        isCreditNote = !!data.CreditNote;
        invoiceData = data.Invoice || data.CreditNote;
    }

    if (invoiceData) {
        try {
            return mapJsonToEHFData(invoiceData, isCreditNote);
        } catch (e) {
            console.error('Something went wrong when generating EHF data (ehf-data-parser.ts)', e);
        }
    }
}

function mapJsonToEHFData(data, isCreditNote): EHFData {
    const ehfData: EHFData =  {
        isCreditNote: isCreditNote,
        invoiceNumber: get(data, 'cbc:ID', ''),
        invoiceDate: getDateText(get(data, 'cbc:IssueDate', '')),
        dueDate: getDateText(get(data, 'cbc:DueDate')),
        note: get(data, 'cbc:Note.#text', ''),
        customerNumber: get(data, 'cac:AccountingCustomerParty.cac:Party.cac:PartyIdentification.cbc:ID.#text', ''),
        customer: getCompanyInfo(get(data, 'cac:AccountingCustomerParty.cac:Party', {})),
        supplier: getCompanyInfo(get(data, 'cac:AccountingSupplierParty.cac:Party', {})),
        paymentInfo: getPaymentInfo(get(data, 'cac:PaymentMeans', [])),
        yourReference: get(data, 'cac:AccountingCustomerParty.cac:Party.cac:Contact.cbc:ID', '') || get(data, 'cbc:BuyerReference', ''),
        amountSummary: {
            taxPercent: formatNumber(get(data, 'cac:TaxTotal.cac:TaxSubtotal.cac:TaxCategory.cbc:Percent', '')),
            taxAmount: getPriceText(get(data, 'cac:TaxTotal.cbc:TaxAmount', ''), isCreditNote),
            taxExclusiveAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:TaxExclusiveAmount', ''), isCreditNote),
            taxInclusiveAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:TaxInclusiveAmount', ''), isCreditNote),
            prepaidAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:PrepaidAmount', ''), isCreditNote),
            payableAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:PayableAmount', ''))
        },
        delivery: getDeliveryInfo(get(data, 'cac:Delivery', {})),
        invoiceLines: getInvoiceLines(data, isCreditNote)
    };

    if (isCreditNote) {
        ehfData.creditNoteNumber = get(data, 'cbc:ID', '');
        ehfData.invoiceNumber = get(data, 'cac:BillingReference.cac:InvoiceDocumentReference.cbc:ID', '')
    } else {
        ehfData.invoiceNumber = get(data, 'cbc:ID', '');
    }

    if (typeof ehfData.invoiceNumber === 'object') {
        ehfData.invoiceNumber = get(ehfData.invoiceNumber, '#text', '');
    }

    if (ehfData.creditNoteNumber && typeof ehfData.creditNoteNumber === 'object') {
        ehfData.creditNoteNumber = get(ehfData.creditNoteNumber, '#text', '');
    }

    const additionalDocRefs = get(data, 'cac:AdditionalDocumentReference');
    if (additionalDocRefs) {
        ehfData.attachments = getAttachments(additionalDocRefs);
    }

    return ehfData;
}


function getPriceText(amountData, isCreditNote?: boolean) {
    const numberFormatted = formatNumber(amountData['#text'], isCreditNote, true);
    return numberFormatted + ' ' + (amountData['@currencyID'] || '');
}

function getDateText(dateString) {
    if (moment(dateString).isValid()) {
        return moment(dateString).format('DD.MM.YYYY');
    } else {
        return dateString;
    }
}

function getCompanyInfo(companyData) {
    const orgNumber = get(companyData, 'cbc:EndpointID.#text', '');
    const legalOrgNumber = get(companyData, 'cac:PartyLegalEntity.cbc:CompanyID.#text', '');

    return {
        name: get(companyData, 'cac:PartyName.cbc:Name', ''),
        orgNumber: orgNumber || legalOrgNumber,
        address: {
            addressLine: get(companyData, 'cac:PostalAddress.cbc:StreetName', ''),
            city: get(companyData, 'cac:PostalAddress.cbc:CityName', ''),
            postalCode: get(companyData, 'cac:PostalAddress.cbc:PostalZone', ''),
            country: get(companyData, 'cac:PostalAddress.cac:Country.cbc:IdentificationCode.#text', ''),
        },
        email: get(companyData, 'cac:Contact.cbc:ElectronicMail', ''),
        phone: get(companyData, 'cac:Contact.cbc:Telephone', '')
    };
}

function getPaymentInfo(paymentData: any[]) {
    const paymentInfo = <any> {};
    if (paymentData && !Array.isArray(paymentData)) {
        paymentData = [paymentData];
    }

    (paymentData || []).forEach(row => {
        const dueDate = getDateText(get(row, 'cbc:PaymentDueDate', ''));
        const kid = get(row, 'cbc:PaymentID', '');
        const accountNumber = get(row, 'cac:PayeeFinancialAccount.cbc:ID', {'@schemeID': ''});

        if (dueDate) {
            paymentInfo.dueDate = dueDate;
        }

        if (kid) {
            paymentInfo.KID = kid;
        }

        if (accountNumber['@schemeID'].includes('IBAN')) {
            paymentInfo.IBAN = accountNumber['#text'];
        } else {
            paymentInfo.accountNumber = accountNumber['#text'];
        }
    });

    return paymentInfo;
}

function getDeliveryInfo(deliveryData) {
    return {
        date: getDateText(get(deliveryData, 'cbc:ActualDeliveryDate', '')),
        address: {
            addressLine: get(deliveryData, 'cac:DeliveryLocation.cac:Address.cbc:StreetName', ''),
            city: get(deliveryData, 'cac:DeliveryLocation.cac:Address.cbc:CityName', ''),
            postalCode: get(deliveryData, 'cac:DeliveryLocation.cac:Address.cbc:PostalZone', ''),
            country: get(deliveryData, 'cac:DeliveryLocation.cac:Address.cac:Country.cbc:IdentificationCode.#text', '')
        }
    };
}

function getInvoiceLines(data, isCreditNote) {
    let invoiceLines = get(data, 'cac:InvoiceLine') || get(data, 'cac:CreditNoteLine') || [];
    // If theres only one line its sent as an object instead of an array
    if (invoiceLines && !Array.isArray(invoiceLines)) {
        invoiceLines = [invoiceLines];
    }

    return invoiceLines.map(line => {
        const quantity = get(line, 'cbc:InvoicedQuantity.#text', '') || get(line, 'cbc:CreditedQuantity.#text', '');
        const vatPercent = get(line, 'cac:Item.cac:ClassifiedTaxCategory.cbc:Percent', '');
        const amount = get(line, 'cbc:LineExtensionAmount', '');

        const isCommentLine = !parseFloat(quantity) && !parseFloat(vatPercent) && !parseFloat(amount);

        return {
            productNumber: get(line, 'cac:Item.cac:SellersItemIdentification.cbc:ID', ''),
            productName: get(line, 'cac:Item.cbc:Name', ''),
            quantity: isCommentLine ? '' : formatNumber(quantity, isCreditNote),
            vatPercent: isCommentLine ? '' : formatNumber(vatPercent),
            vatExclusiveAmount: isCommentLine ? '' : getPriceText(amount, isCreditNote),
        };
    });
}

function formatNumber(value: string, isCreditNote?: boolean, forceTwoDecimals?: boolean): string {
    if (!parseFloat(value)) {
        return forceTwoDecimals ? '0,00' : '0';
    }

    let [int, decimal] = value.split('.');

    if (isCreditNote) {
        int = (parseInt(int, 10) * -1).toString();
    }

    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    if (decimal === undefined) {
        return int;
    }

    const trailingDecimals = decimal.slice(2);
    if (parseInt(trailingDecimals, 10) > 0) {
        return [int, decimal].join(',');
    } else {
        decimal = decimal.slice(0, 2);
        if (!parseInt(decimal, 10) && !forceTwoDecimals) {
            return int;
        } else {
            const val = [int, decimal].join(',')
            return val;
        }
    }
}

function getAttachments(additionalDocRefs): EHFAttachment[] {
    // Will sometimes be object and sometimes be array,
    // make sure its always array here.
    if (!Array.isArray(additionalDocRefs)) {
        additionalDocRefs = [additionalDocRefs];
    }

    const attachments: EHFAttachment[] = [];
    additionalDocRefs.forEach(docRef => {
        const attachmentRef = get(docRef, 'cac:Attachment');


        if (attachmentRef) {
            let label = get(docRef, 'cbc:DocumentDescription') || get(docRef, 'cbc:DocumentType') || get(docRef, 'cbc:ID');
            const embeddedDocument = get(attachmentRef, 'cbc:EmbeddedDocumentBinaryObject');
            const externalRef = get(attachmentRef, 'cac:ExternalReference');

            // Base64 encoded document
            if (embeddedDocument) {
                const base64Data = get(embeddedDocument, '#text');
                const mimeCode = get(embeddedDocument, '@mimeCode');
                if (base64Data && mimeCode) {
                    const bytes = toByteArray(base64Data);
                    const blob = new Blob([bytes], {type: mimeCode});

                    if (label === 'Commercial invoice') {
                        label = 'Orginalfaktura';
                    }

                    attachments.push({
                        label: label,
                        resourceUrl: URL.createObjectURL(blob),
                        mimeType: mimeCode
                    });
                }
            // Link
            } else if (externalRef && get(externalRef, 'cbc:URI')) {
                attachments.push({
                    label: label,
                    externalUrl: get(externalRef, 'cbc:URI')
                });
            }
        } else {
            // Plaintext
            const label = get(docRef, 'cbc:DocumentDescription') || get(docRef, 'cbc:DocumentType');
            const value = get(docRef, 'cbc:ID');
            if (label && value) {
                attachments.push({
                    label: label,
                    plaintext: value
                });
            }
        }
    });

    return attachments;
}
