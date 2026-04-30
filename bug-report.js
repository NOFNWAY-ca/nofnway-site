(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    function makeMailto() {
        var title = (document.title || 'NOFNWAY tool').replace(/\s+[-–|]\s+NOFNWAY.*$/i, '').trim();
        var url = window.location.href.split('#')[0];
        var subject = 'Bug report: ' + title;
        var body = [
            'Tool: ' + title,
            'Page: ' + url,
            '',
            'What broke?',
            '',
            '',
            'What were you trying to do?',
            '',
            '',
            'Device / browser, if you know it:',
            ''
        ].join('\n');

        return 'mailto:hello@nofnway.ca?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    ready(function () {
        if (document.querySelector('[data-bug-report-link]')) return;

        var link = document.createElement('a');
        link.className = 'bug-report-btn';
        link.href = makeMailto();
        link.setAttribute('data-bug-report-link', 'true');
        link.setAttribute('aria-label', 'Report a bug with this tool');
        link.textContent = 'Report bug';

        document.body.appendChild(link);
    });
}());
