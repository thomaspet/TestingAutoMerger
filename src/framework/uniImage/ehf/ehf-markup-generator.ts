import {EHFData} from './ehf-model';

export function generateEHFMarkup(invoice: EHFData) {
    if (!invoice) {
        return '';
    }

    try {
        return `
            <section class="uni-ehf">
                <section class="invoice-head">
                    <section class="supplier-and-customer">
                        <section>
                            <h4>LEVERANDØR</h4>
                            ${getCompanyInfoMarkup(invoice.supplier)}
                        </section>

                        <section>
                            <h4>KUNDE</h4>

                            ${getCompanyInfoMarkup(invoice.customer)}
                        </section>
                    </section>

                    <section class="invoice-details">
                        <h1>${invoice.isCreditNote ? 'EHF Kreditnota' : 'EHF'}</h1>
                        ${getInvoiceDetailsMarkup(invoice)}
                    </section>
                </section>

                ${getTableMarkup(invoice)}

                ${
                    invoice.note ? `
                        <section class="freetext">
                            ${invoice.note}
                        </section>
                    ` : ''
                }

                <section class="summary">
                    ${getInvoiceSums(invoice)}
                </section>
            </section>
        `;
    } catch (e) {
        console.error('Error generating EHF markup (ehf-markup-generator.ts)', e);
        return;
    }
}

function getCompanyInfoMarkup(company) {
    const address = company.address || {};
    return `
        <section>${company.name || ''}</section>
        <section>${address.addressLine || ''}</section>
        <section>
            ${address.postalCode || ''}
            ${address.city || ''}
            ${address.country || ''}
        </section>
        <section>Org.nummer: ${company.orgNumber || ''}</section>
        ${
            company.email ? `
                <section>Epost: ${company.email}</section>
            ` : ''
        }

        ${
            company.phone ? `
                <section>Tlf: ${company.phone}</section>
            ` : ''
        }
    `;
}

function getInvoiceDetailsMarkup(invoice: EHFData) {
    const paymentInfo: any = invoice.paymentInfo || {};
    return `
        <dl>
            <dt>Kundenummer</dt>
            <dd>${invoice.customerNumber || ''}</dd>

            ${
                invoice.isCreditNote && invoice.creditNoteNumber ? `
                    <dt>Kreditnota</dt>
                    <dd>${invoice.creditNoteNumber || ''}</dd>
                ` : ''
            }

            <dt>${invoice.isCreditNote ? 'Ref. fakturanr' : 'Fakturanummer'}</dt>
            <dd>${invoice.invoiceNumber || ''}</dd>

            <dt>Fakturadato</dt>
            <dd>${invoice.invoiceDate || ''}</dd>

            <dt>Forfallsdato</dt>
            <dd>${invoice.dueDate || paymentInfo.dueDate || ''}</dd>

            ${
                invoice.delivery.date ? `
                    <dt>Leveringsdato</dt>
                    <dd>${invoice.delivery.date}</dd>
                ` : ''
            }

            <dt>Kontonummer</dt>
            <dd>${paymentInfo.accountNumber || ''}</dd>

            ${
                paymentInfo.IBAN ? `
                    <dt>IBAN</dt>
                    <dd>${paymentInfo.IBAN}</dd>
                ` : ''
            }

            <dt>KID</dt>
            <dd>${paymentInfo.KID || ''}</dd>

            ${
                invoice.yourReference ? `
                    <dt>Deres referanse</dt>
                    <dd>${invoice.yourReference}</dd>
                ` : ''
            }
        </dl>
    `;
}

function getTableMarkup(invoice: EHFData) {
    if (!invoice.invoiceLines || !invoice.invoiceLines.length) {
        return '';
    }

    return `
        <table>
            <thead>
                <tr>
                    <th>Varenummer</th>
                    <th>Tekst</th>
                    <th class="number">Antall</th>
                    <th class="number mva">Mva</th>
                    <th class="number sum">Sum eks. mva</th>
                </tr>
            </thead>

            <tbody>
                ${
                    invoice.invoiceLines.map(line => `
                        <tr>
                            <td>${line.productNumber}</td>
                            <td>${line.productName}</td>
                            <td class="number">${line.quantity}</td>
                            <td class="number">${line.vatPercent ? line.vatPercent + '%' : ''}</td>
                            <td class="number">${line.vatExclusiveAmount}</td>
                        </tr>
                    `).join('')
                }
            </tbody>
        </table>
    `;
}

function getInvoiceSums(invoice: EHFData) {
    if (!invoice.amountSummary) {
        return '';
    }

    const sums = invoice.amountSummary;

    return `
        <dl>
            <dt>Sum eks. mva.</dt>
            <dd>${sums.taxExclusiveAmount}</dd>

            <dt>Mva ${+sums.taxPercent ? sums.taxPercent + '%' : ''}</dt>
            <dd>${sums.taxAmount}</dd>

            <dt>Sum inkl. mva.</dt>
            <dd>${sums.taxInclusiveAmount}</dd>

            ${
                invoice.isCreditNote ? '' : `
                    <dt>Forhåndsbetalt</dt>
                    <dd>${sums.prepaidAmount}</dd>
                `
            }
        </dl>
        <dl class="total">
            <dt>Beløp ${invoice.isCreditNote ? 'tilgode' : 'til betaling'}</dt>
            <dd>${sums.payableAmount}</dd>
        </dl>
    `;
}

