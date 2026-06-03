(function() {
    let papers = [];
    let originalContent = null;

    function initSearch() {
        extractPaperData();
        setupEventListeners();
    }

    function extractPaperData() {
        const paperCards = document.querySelectorAll('.paper-card');
        papers = [];
        paperCards.forEach((card, index) => {
            const titleElement = card.querySelector('h4 a') || card.querySelector('h4');
            const authorsElement = card.querySelector('.authors');
            const statusElement = card.querySelector('.status-journal, .journal-version');
            const sectionElement = card.closest('[id]');
            if (titleElement) {
                papers.push({
                    index: index,
                    title: titleElement.textContent.trim(),
                    authors: authorsElement ? authorsElement.textContent.replace('with ', '').trim() : '',
                    status: statusElement ? statusElement.textContent.trim() : '',
                    section: sectionElement ? sectionElement.id : '',
                    element: card
                });
            }
        });
    }

    function setupEventListeners() {
        const searchInput = document.getElementById('paper-search');
        const clearButton = document.getElementById('clear-search');
        const ribbonSearch = document.querySelector('.ribbon-search');

        if (searchInput) {
            searchInput.addEventListener('focus', function() {
                if (ribbonSearch) ribbonSearch.classList.add('open');
                try { document.body.classList.add('search-open'); } catch (e) {}
            });
            searchInput.addEventListener('input', handleSearch);
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Escape') {
                    clearSearch();
                    if (ribbonSearch) ribbonSearch.classList.remove('open');
                    try { document.body.classList.remove('search-open'); } catch (e) {}
                }
            });
        }

        if (ribbonSearch) {
            if (!ribbonSearch.hasAttribute('tabindex')) ribbonSearch.setAttribute('tabindex', '0');
            function openSearchCap() {
                ribbonSearch.classList.add('open');
                try { document.body.classList.add('search-open'); } catch (e) {}
                if (searchInput) { searchInput.focus(); const val = searchInput.value; searchInput.value = ''; searchInput.value = val; }
            }
            const openHandler = function(e) {
                if (e.target !== searchInput && !e.target.closest('#paper-search') && !e.target.closest('#clear-search')) openSearchCap();
            };
            ribbonSearch.addEventListener('mousedown', openHandler);
            ribbonSearch.addEventListener('click', openHandler);
            ribbonSearch.addEventListener('touchstart', function(e) {
                if (e.target !== searchInput && !e.target.closest('#paper-search') && !e.target.closest('#clear-search')) openSearchCap();
            }, {passive: true});
            ribbonSearch.addEventListener('keydown', function(e) {
                if ((e.key === 'Enter' || e.key === ' ') && !ribbonSearch.classList.contains('open')) { e.preventDefault(); openSearchCap(); }
            });
            document.addEventListener('keydown', function(e) {
                const active = document.activeElement;
                const inField = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
                if (!inField && e.key === '/') { e.preventDefault(); openSearchCap(); }
            });
            document.addEventListener('mousedown', function(e) {
                if (!ribbonSearch.contains(e.target)) { ribbonSearch.classList.remove('open'); try { document.body.classList.remove('search-open'); } catch (e) {} }
            });
            document.addEventListener('touchstart', function(e) {
                if (!ribbonSearch.contains(e.target)) { ribbonSearch.classList.remove('open'); try { document.body.classList.remove('search-open'); } catch (e) {} }
            }, {passive: true});
        }

        if (clearButton) {
            clearButton.addEventListener('touchstart', function(e) { e.stopPropagation(); }, {passive: true});
            clearButton.addEventListener('click', function(e) {
                e.stopPropagation();
                clearSearch();
                if (ribbonSearch) ribbonSearch.classList.remove('open');
                try { document.body.classList.remove('search-open'); } catch (e) {}
                if (searchInput) searchInput.blur();
            });
        }
    }

    function handleSearch() {
        const query = document.getElementById('paper-search').value.trim().toLowerCase();
        const clearButton = document.getElementById('clear-search');
        if (query.length === 0) { clearSearch(); return; }
        clearButton.style.display = 'block';
        const matches = papers.filter(paper =>
            paper.title.toLowerCase().includes(query) ||
            paper.authors.toLowerCase().includes(query) ||
            paper.status.toLowerCase().includes(query)
        );
        displaySearchResults(matches, query);
        if (typeof updateStickyRibbonSpacer === 'function') { try { updateStickyRibbonSpacer(); } catch (e) {} } else { window.dispatchEvent(new Event('resize')); }
        if (typeof updateStickyRibbonActive === 'function') { try { updateStickyRibbonActive(); } catch (e) {} }
    }

    function displaySearchResults(matches, query) {
        if (!originalContent) {
            const sections = document.querySelectorAll('[id="publications"], [id="working-papers"]');
            originalContent = Array.from(sections).map(section => ({ element: section, display: section.style.display || '' }));
        }
        const existingNoResults = document.querySelector('.search-no-results');
        if (existingNoResults) existingNoResults.remove();

        if (matches.length === 0) {
            document.querySelectorAll('.paper-card').forEach(function(card) { card.style.display = 'none'; });
            originalContent.forEach(item => { item.element.style.display = 'none'; });
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'search-no-results';
            noResultsDiv.innerHTML = `<div style="padding-top:3em;text-align:center;"><i class="fas fa-search" style="font-size:2.5em;color:#bbb;margin-bottom:1em;display:block;"></i><h3 style="margin-bottom:0.5em;color:#444;">No papers match "<strong style="color:#7f0a20;">${query}</strong>"</h3><p style="color:#999;font-size:0.95em;">Try searching for author names, paper titles, or keywords.</p></div>`;
            const stickyRibbon = document.querySelector('.section-ribbon.sticky-ribbon');
            if (stickyRibbon) stickyRibbon.insertAdjacentElement('afterend', noResultsDiv);
        } else {
            document.querySelectorAll('.paper-card').forEach(function(card) { card.style.display = 'none'; });
            const sectionsToShow = new Set();
            matches.forEach(paper => { paper.element.style.display = 'block'; sectionsToShow.add(paper.section); });
            originalContent.forEach(item => { item.element.style.display = sectionsToShow.has(item.element.id) ? (item.display || 'block') : 'none'; });
        }
    }

    function clearSearch() {
        const searchInput = document.getElementById('paper-search');
        const clearButton = document.getElementById('clear-search');
        searchInput.value = '';
        clearButton.style.display = 'none';
        const existingNoResults = document.querySelector('.search-no-results');
        if (existingNoResults) existingNoResults.remove();
        if (originalContent) {
            originalContent.forEach(item => { item.element.style.display = item.display; });
            document.querySelectorAll('.paper-card').forEach(function(card) { card.style.display = 'block'; });
        }
        if (typeof updateStickyRibbonSpacer === 'function') { try { updateStickyRibbonSpacer(); } catch (e) {} }
        if (typeof updateStickyRibbonActive === 'function') { try { updateStickyRibbonActive(); } catch (e) {} }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initSearch); } else { initSearch(); }
})();
