import {EHFData, EHFAttachment} from './ehf-model';
import {get as lodashGet} from 'lodash';
import {toByteArray } from 'base64-js';
import * as moment from 'moment';

function get(data, path, defaultValue?) {
    let value = lodashGet(data, path);
    if (!value) {
        let newPath = path.split('cbc:').join('');
        newPath = newPath.split('cac:').join('');
        value = lodashGet(data, newPath);
    }

    return value || defaultValue;
}

export function parseEHFData(data) {
    let invoiceData;
    let isCreditNote;

    if (data.StandardBusinessDocument) {
        isCreditNote = !!data.StandardBusinessDocument.CreditNote;
        invoiceData = data.StandardBusinessDocument.Invoice
            || data.StandardBusinessDocument['inv:Invoice']
            || data.StandardBusinessDocument.CreditNote;
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
        dueDate: getDueDate(data),
        note: get(data, 'cbc:Note.#text') || get(data, 'cbc:Note', ''),
        customerNumber: get(data, 'cac:AccountingCustomerParty.cac:Party.cac:PartyIdentification.cbc:ID.#text', ''),
        customer: getCompanyInfo(get(data, 'cac:AccountingCustomerParty.cac:Party', {})),
        supplier: getCompanyInfo(get(data, 'cac:AccountingSupplierParty.cac:Party', {})),
        paymentInfo: getPaymentInfo(get(data, 'cac:PaymentMeans', [])),
        yourReference: getYourReference(data),
        amountSummary: getAmountSummary(data, isCreditNote),
        delivery: getDeliveryInfo(get(data, 'cac:Delivery', {})),
        invoiceLines: getInvoiceLines(data, isCreditNote),
        taxSummary: getTaxSummary(get(data, 'cac:TaxTotal.cac:TaxSubtotal'), isCreditNote)
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

    const additionalDocRefs = get(data, 'AdditionalDocumentReference') || get(data, 'cac:AdditionalDocumentReference');
    if (additionalDocRefs) {
        ehfData.attachments = getAttachments(additionalDocRefs);
    }

    return ehfData;
}

function getYourReference(data) {
    const buyerRef = get(data, 'cbc:BuyerReference.#text') || get(data, 'cbc:BuyerReference', '');
    if (buyerRef) {
        return buyerRef;
    } else {
        const contact = get(data, 'cac:AccountingCustomerParty.cac:Party.cac:Contact.cbc:ID', '');
        return get(contact, '#text') || contact;
    }
}

function getPriceText(amountData, invertNumber?: boolean) {
    const numberFormatted = formatNumber(amountData['#text'], invertNumber, true);
    return numberFormatted + ' ' + (amountData['@currencyID'] || '');
}

function getDateText(date) {
    const dateString = get(date, '#text') ? get(date, '#text') : date;

    if (dateString && moment(dateString).isValid()) {
        return moment(dateString).format('DD.MM.YYYY');
    }
}

function getDueDate(data) {
    const ehf3DueDate = get(data, 'cbc:DueDate');
    if (ehf3DueDate) {
        return getDateText(ehf3DueDate);
    } else {
        let paymentInfo = get(data, 'cac:PaymentMeans', []);
        if (paymentInfo && !Array.isArray(paymentInfo)) {
            paymentInfo = [paymentInfo];
        }

        let ehf2DueDate;
        paymentInfo.forEach(info => {
            let date = get(info, 'cbc:PaymentDueDate');
            if (get(date, '#text')) {
                date = get(date, '#text');
            }

            if (date && moment(date).isValid()) {
                if (!ehf2DueDate || moment(ehf2DueDate).isAfter(moment(date))) {
                    ehf2DueDate = date;
                }
            }
        });

        return getDateText(ehf2DueDate);
    }
}

function getCompanyInfo(companyData) {
    const orgNumber = get(companyData, 'cbc:EndpointID.#text', '');
    const legalOrgNumber = get(companyData, 'cac:PartyLegalEntity.cbc:CompanyID.#text', '');

    const partyName = get(companyData, 'cac:PartyName', '');
    const postalAddress = get(companyData, 'cac:PostalAddress', {});
    const contact = get(companyData, 'cac:Contact', {});

    return {
        name: get(partyName, 'cbc:Name.#text') || get(partyName, 'cbc:Name', ''),
        orgNumber: orgNumber || legalOrgNumber,
        address: {
            addressLine: get(postalAddress, 'cbc:StreetName.#text') || get(postalAddress, 'cbc:StreetName', ''),
            city: get(postalAddress, 'cbc:CityName.#text') || get(postalAddress, 'cbc:CityName', ''),
            postalCode: get(postalAddress, 'cbc:PostalZone.#text') || get(postalAddress, 'cbc:PostalZone', ''),
            country: get(postalAddress, 'cac:Country.cbc:IdentificationCode.#text', ''),
        },
        email: get(contact, 'cbc:ElectronicMail.#text') || get(contact, 'cbc:ElectronicMail', ''),
        phone: get(contact, 'cbc:Telephone.#text') || get(contact, 'cbc:Telephone', '')
    };
}

function getPaymentInfo(paymentData: any[]) {
    const paymentInfo = <any> {};
    if (paymentData && !Array.isArray(paymentData)) {
        paymentData = [paymentData];
    }

    (paymentData || []).forEach(row => {
        const kid = get(row, 'cbc:PaymentID.#text') || get(row, 'cbc:PaymentID', '');

        const institutionBranch = get(row, 'cac:PayeeFinancialAccount.cac:FinancialInstitutionBranch');
        const accountNumber = get(row, 'cac:PayeeFinancialAccount.cbc:ID', {});

        if (kid) {
            paymentInfo.KID = kid;
        }

        if (accountNumber['@schemeID'] || accountNumber['#text']) {
            if (accountNumber['@schemeID'] && accountNumber['@schemeID'].includes('IBAN')) {
                paymentInfo.IBAN = accountNumber['#text'];
            } else {
                paymentInfo.accountNumber = accountNumber['#text'];
            }
        } else {
            const accNo = get(accountNumber, '#text') || accountNumber;
            if (institutionBranch) {
                paymentInfo.IBAN = accNo;
            } else {
                paymentInfo.accountNumber = accNo;
            }
        }


    });

    return paymentInfo;
}

function getTaxSummary(taxData, isCreditNote: boolean) {
    if (!taxData) {
        return [];
    }

    if (taxData && !Array.isArray(taxData)) {
        taxData = [taxData];
    }

    return taxData.map(subTotal => {
        let percent = get(subTotal, 'cac:TaxCategory.cbc:Percent');
        if (get(percent, '#text')) {
            percent = get(percent, '#text', 0);
        }

        return {
            taxPercent: (parseFloat(percent)) + '%',
            taxableAmount: getPriceText(get(subTotal, 'cbc:TaxableAmount'), isCreditNote),
            taxAmount: getPriceText(get(subTotal, 'cbc:TaxAmount'), isCreditNote)
        };
    });
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
    let invoiceLines = get(data, 'InvoiceLine') || get(data, 'cac:InvoiceLine') || get(data, 'CreditNoteLine') || get(data, 'cac:CreditNoteLine') || [];

    // If theres only one line its sent as an object instead of an array
    if (invoiceLines && !Array.isArray(invoiceLines)) {
        invoiceLines = [invoiceLines];
    }

    return invoiceLines.map(line => {
        const description = get(line, 'cac:Item.cbc:Description');
        const isDiscount = get(line, 'cac:AllowanceCharge.cbc:ChargeIndicator');
        const discountString = get(line, 'cac:AllowanceCharge.cbc:Amount.#text');
        const note = get(line, 'cbc:Note');
        const amount = get(line, 'cbc:LineExtensionAmount');
        const productNumber = get(line, 'cac:Item.cac:SellersItemIdentification.cbc:ID', '');
        const productName = get(line, 'cac:Item.cbc:Name', '');
        const quantity = get(line, 'cbc:InvoicedQuantity.#text', '') || get(line, 'cbc:CreditedQuantity.#text', '');

        let vatPercent = get(line, 'cac:Item.cac:ClassifiedTaxCategory.cbc:Percent', '');
        if (get(vatPercent, '#text')) {
            vatPercent = get(vatPercent, '#text');
        }

        let discount = 0.00;
        if (isDiscount === 'false' && parseFloat(discountString) !== 0) {
            discount = (parseFloat(discountString) / (parseFloat(get(amount, '#text')) + parseFloat(discountString))) * 100;
        }

        const isCommentLine = !parseFloat(quantity) && !parseFloat(vatPercent) && !parseFloat(amount);

        return {
            productNumber: get(productNumber, '#text') || productNumber,
            productName: get(productName, '#text') || productName,
            quantity: isCommentLine ? '' : formatNumber(quantity, isCreditNote),
            vatPercent: isCommentLine ? '' : formatNumber(vatPercent),
            vatExclusiveAmount: isCommentLine ? '' : getPriceText(amount, isCreditNote),
            discount: discount === 0 ? '' : Number(discount.toFixed(2)).toString(),
            description: get(description, '#text') || description,
            note: get(note, '#text') || note,
        };
    });
}

function getAmountSummary(data, isCreditNote: boolean) {
    const amountSummary: any = {
        taxAmount: getPriceText(get(data, 'cac:TaxTotal.cbc:TaxAmount', ''), isCreditNote),
        taxExclusiveAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:TaxExclusiveAmount', ''), isCreditNote),
        taxInclusiveAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:TaxInclusiveAmount', ''), isCreditNote),
        payableAmount: getPriceText(get(data, 'cac:LegalMonetaryTotal.cbc:PayableAmount', ''))
    };

    let allowanceCharges = get(data, 'cac:AllowanceCharge');
    if (allowanceCharges) {
        if (!Array.isArray(allowanceCharges)) {
            allowanceCharges = [allowanceCharges];
        }

        if (allowanceCharges.length) {
            allowanceCharges = allowanceCharges.map(ac => {
                const chargeIndicator = get(ac, 'cbc:ChargeIndicator');
                const isCharge = chargeIndicator && chargeIndicator !== 'false'; // can be string some times..

                const percent = parseFloat(get(ac, 'cbc:MultiplierFactorNumeric', 0));
                const amount = getPriceText(get(ac, 'cbc:Amount'), !isCharge && !isCreditNote);


                return {
                    label: isCharge ? 'Gebyr' : 'Godtgjørelse',
                    value: percent ? percent + '%' : amount,
                    description: get(ac, 'cbc:AllowanceChargeReason', '')
                };
            });

            amountSummary.allowanceCharges = allowanceCharges;
        }
    }

    const prepaidAmount = get(data, 'cac:LegalMonetaryTotal.cbc:PrepaidAmount', '');
    if (prepaidAmount && !isCreditNote) {
        const formatted = getPriceText(prepaidAmount, isCreditNote);
        if (formatted !== '0,00 NOK') {
            amountSummary.prepaidAmount = formatted;
        }
    }

    const roundingAmount = get(data, 'cac:LegalMonetaryTotal.cbc:PayableRoundingAmount');
    if (roundingAmount) {
        amountSummary.payableRoundingAmount = getPriceText(roundingAmount, isCreditNote);
    }

    return amountSummary;
}

function formatNumber(value: string, invertNumber?: boolean, forceTwoDecimals?: boolean): string {
    if (!parseFloat(value)) {
        return forceTwoDecimals ? '0,00' : '0';
    }

    let [int, decimal] = value.split('.');

    if (invertNumber) {
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
            if (get(label, '#text')) {
                label = get(label, '#text');
            }

            const embeddedDocument = get(attachmentRef, 'cbc:EmbeddedDocumentBinaryObject');
            const externalRef = get(attachmentRef, 'cac:ExternalReference');

            // Base64 encoded document
            if (embeddedDocument) {
                let base64Data = get(embeddedDocument, '#text');
                const mimeCode = get(embeddedDocument, '@mimeCode');

                if (base64Data && mimeCode) {
                    // Apparently telenor likes to format their base64 strings
                    // with whitespace. Needs to be removed before we can make
                    // a byte array of it..
                    base64Data = base64Data.replace(/\s/g, '');
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
            let label = get(docRef, 'cbc:DocumentDescription') || get(docRef, 'cbc:DocumentType');
            if (get(label, '#text')) {
                label = get(label, '#text');
            }

            let value = get(docRef, 'cbc:ID');
            if (get(value, '#text')) {
                value = get(value, '#text');
            }

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
