import { ConsentString } from 'consent-string';
import gdprModals from './gdpr-modal.html';
import gdprModalEn from './gdpr-modal-en.json';
import gdprModalFr from './gdpr-modal-fr.json';
import vendorlist from './vendorlist.json';

const consentData = new ConsentString();
consentData.setGlobalVendorList(vendorlist);

consentData.setCmpId(1);
consentData.setCmpVersion(1);
consentData.setConsentScreen(1);

module.exports = callback => {
    var language = gdprModalEn;
    consentData.setConsentLanguage('en');

    if (window.navigator.userLanguage || window.navigator.language) {
        var browserLanguage = 'window.navigator.userLanguage || window.navigator.language';
        if (browserLanguage.startsWith('fr')) {
            language = gdprModalFr;
            consentData.setConsentLanguage('fr');
        }
    }

    var translateRegex = /{{([^}]+)}}/g;

    var html = gdprModals;
    var match = null;
    while (match = translateRegex.exec(html)) {
        if (language[match[1]]) {
            html = html.replace(match[0], language[match[1]]);
        }
    }

    const container = document.createElement('div');
    container.id = "gigz-gdpr-modals";
    container.innerHTML = html;
    document.body.appendChild(container);

    // Load purposes/vendors list
    var purposeTable = document.querySelector('#gigz-gdpr-purposes table');
    vendorlist.purposes.forEach(purpose => {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <h3>${purpose.name}</h3>
                <p>${purpose.description}</p>
            </td>
            <td>
                <div class="gigz-gdpr-switch">
                    <input type="checkbox" data-purpose-id="${purpose.id}">
                    <div></div>
                    <span class="gigz-gdpr-disabled">${language.disabled}</span>
                    <span class="gigz-gdpr-enabled">${language.enabled}</span>
                </div>
            </td>
        `;
        purposeTable.appendChild(tr);
    });

    var vendorTable = document.querySelector('#gigz-gdpr-vendors table');
    vendorlist.vendors.forEach(vendor => {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <h3>${vendor.name}</h3>
            </td>
            <td>
                <div class="gigz-gdpr-switch">
                    <input type="checkbox" data-vendor-id="${vendor.id}">
                    <div></div>
                    <span class="gigz-gdpr-disabled">${language.disabled}</span>
                    <span class="gigz-gdpr-enabled">${language.enabled}</span>
                </div>
            </td>
        `;
        vendorTable.appendChild(tr);
    });

    // Setup events

    // Click on buttons
    document.querySelector('.gigz-gdpr-accept').addEventListener('click', () => {
        consentData.setPurposesAllowed(vendorlist.purposes.map(purpose => purpose.id));
        consentData.setVendorsAllowed(vendorlist.vendors.map(vendor => vendor.id));

        document.body.removeChild(document.getElementById('gigz-gdpr-modals'));
        callback(consentData);
    });

    document.querySelectorAll('.gigz-gdpr-save-quit').forEach(button => {
        button.addEventListener('click', () => {
            document.body.removeChild(document.getElementById('gigz-gdpr-modals'));
            callback(consentData);
        });
    });

    document.querySelectorAll('.gigz-gdpr-back').forEach(button => {
        button.addEventListener('click', () => {
            consentData.setConsentScreen(1);
            document.getElementById('gigz-gdpr-home').style.display = 'block';
            document.getElementById('gigz-gdpr-purposes').style.display = 'none';
            document.getElementById('gigz-gdpr-vendors').style.display = 'none';
        });
    });

    document.querySelectorAll('.gigz-gdpr-more-options, .gigz-gdpr-show-purposes-list').forEach(button => {
        button.addEventListener('click', () => {
            consentData.setConsentScreen(2);
            document.getElementById('gigz-gdpr-home').style.display = 'none';
            document.getElementById('gigz-gdpr-purposes').style.display = 'block';
            document.getElementById('gigz-gdpr-vendors').style.display = 'none';
        });
    });

    document.querySelectorAll('.gigz-gdpr-show-vendors-list').forEach(button => {
        button.addEventListener('click', () => {
            consentData.setConsentScreen(3);
            document.getElementById('gigz-gdpr-home').style.display = 'none';
            document.getElementById('gigz-gdpr-purposes').style.display = 'none';
            document.getElementById('gigz-gdpr-vendors').style.display = 'block';
        });
    });

    // Checkbox events
    document.querySelectorAll('#gigz-gdpr-purposes input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', e => {
            consentData.setPurposeAllowed(parseInt(e.target.dataset.purposeId), e.target.checked);
        });
    });

    document.querySelectorAll('#gigz-gdpr-vendors input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', e => {
            consentData.setVendorAllowed(parseInt(e.target.dataset.vendorId), e.target.checked);
        });
    });

    // Check/uncheck all
    document.querySelector('#gigz-gdpr-purposes .gigz-gdpr-accept-all').addEventListener('click', () => {
        document.querySelectorAll('#gigz-gdpr-purposes input[type="checkbox"]').forEach(input => input.checked = true);
        consentData.setPurposesAllowed(vendorlist.purposes.map(purpose => purpose.id));
    });

    document.querySelector('#gigz-gdpr-purposes .gigz-gdpr-refuse-all').addEventListener('click', () => {
        document.querySelectorAll('#gigz-gdpr-purposes input[type="checkbox"]').forEach(input => input.checked = false);
        consentData.setPurposesAllowed([]);
    });

    document.querySelector('#gigz-gdpr-vendors .gigz-gdpr-accept-all').addEventListener('click', () => {
        document.querySelectorAll('#gigz-gdpr-vendors input[type="checkbox"]').forEach(input => input.checked = true);
        consentData.setVendorsAllowed(vendorlist.vendors.map(vendor => vendor.id));
    });

    document.querySelector('#gigz-gdpr-vendors .gigz-gdpr-refuse-all').addEventListener('click', () => {
        document.querySelectorAll('#gigz-gdpr-vendors input[type="checkbox"]').forEach(input => input.checked = false);
        consentData.setVendorsAllowed([]);
    });
};