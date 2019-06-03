import gdprModals from './gdpr-modals.html';

module.exports = {
    loadModals: function(callback) {
        const container = document.createElement('div');
        container.id = "gigz-gdpr-modals";
        container.innerHTML = gdprModals;
        document.body.appendChild(container);

        // Setup events

        // Click on buttons
        document.getElementById('acceptGDPR').addEventListener('click', function() {
            module.exports.hideFirstModal();
            callback(true, true, true);
        });

        document.getElementById('configCookies').addEventListener('click', function() {
            module.exports.hideFirstModal();
            module.exports.showSecondModal();
        });

        document.getElementById('saveGDPR').addEventListener('click', function() {
            module.exports.hideSecondModal();
            callback(
                document.querySelector('#gigz-cookieConfig-popin #customSwitchPerformance').checked,
                document.querySelector('#gigz-cookieConfig-popin #customSwitchFeature').checked,
                document.querySelector('#gigz-cookieConfig-popin #customSwitchTargetPub').checked
            );
        });

        // Tabs
        document.querySelectorAll('#gigz-cookieConfig-popin .nav-link').forEach(elt => {
            var id = elt.attributes['aria-controls'].value;
            var relatedTabContent = document.querySelector(`#gigz-cookieConfig-popin #${id}`);
            elt.addEventListener('click', e => {
                var selectedTab = document.querySelector('#gigz-cookieConfig-popin .nav-link.active');
                var selectedTabContent = document.querySelector('#gigz-cookieConfig-popin .tab-pane.active');

                if (selectedTab !== elt) {
                    selectedTab.classList.remove('active');
                    selectedTabContent.classList.remove('show');
                    elt.classList.add('active');

                    setTimeout(() => {
                        selectedTabContent.classList.remove('active');
                        relatedTabContent.classList.add('active');
                        setTimeout(() => relatedTabContent.classList.add('show'), 0);
                    }, 300);
                }
            });
        });

        // Check/uncheck all
        document.querySelector('#gigz-cookieConfig-popin #allCookiesOK').addEventListener('click', () => {
            document.querySelector('#gigz-cookieConfig-popin #customSwitchPerformance').checked = true;
            document.querySelector('#gigz-cookieConfig-popin #customSwitchFeature').checked = true;
            document.querySelector('#gigz-cookieConfig-popin #customSwitchTargetPub').checked = true;
        });

        document.querySelector('#gigz-cookieConfig-popin #allCookiesNO').addEventListener('click', () => {
            document.querySelector('#gigz-cookieConfig-popin #customSwitchPerformance').checked = false;
            document.querySelector('#gigz-cookieConfig-popin #customSwitchFeature').checked = false;
            document.querySelector('#gigz-cookieConfig-popin #customSwitchTargetPub').checked = false;
        });
    },
    showFirstModal: function() {
        document.getElementById('gigz-cookie-popin').classList.add('active');

        setTimeout(() => {
            document.getElementById('gigz-cookie-popin').classList.add('show');
        }, 0);
    },
    hideFirstModal: function() {
        document.getElementById('gigz-cookie-popin').classList.remove('show');

        setTimeout(() => {
            document.getElementById('gigz-cookie-popin').classList.remove('active');
        }, 300);
    },
    showSecondModal: function() {
        document.getElementById('gigz-cookieConfig-popin').classList.add('active');

        setTimeout(() => {
            document.getElementById('gigz-cookieConfig-popin').classList.add('show');
        }, 0);
    },
    hideSecondModal: function() {
        document.getElementById('gigz-cookieConfig-popin').classList.remove('show');

        setTimeout(() => {
            document.getElementById('gigz-cookieConfig-popin').classList.remove('active');
        }, 300);
    }
};