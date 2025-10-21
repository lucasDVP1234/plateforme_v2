// public/js/filters.js

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-button');
    const ageMinInput = document.getElementById('age-min');
    const ageMaxInput = document.getElementById('age-max');
    const selectedFiltersContainer = document.getElementById('selected-filters-container');
    const filterForm = document.querySelector('form[action="/creators"]');

    let selectedAgeMin = '';
    let selectedAgeMax = '';
    let selectedCategories = [];
    let selectedVideoTypes = [];
    let selectedCountries = [];
    let selectedLangues = [];
    let selectedAtouts = [];
    let selectedGenres = [];
    

    // Function to update selected filters display
    function updateSelectedFiltersDisplay() {
        selectedFiltersContainer.innerHTML = '';

        // Display selected categories
        selectedCategories.forEach((category) => {
            const bubble = createFilterBubble(category, 'Category');
            selectedFiltersContainer.appendChild(bubble);
        });

        // Display selected video types
        selectedVideoTypes.forEach((type) => {
            const bubble = createFilterBubble(type, 'Type of Videos');
            selectedFiltersContainer.appendChild(bubble);
        });

        // Display selected countries
        selectedCountries.forEach((country) => {
            const bubble = createFilterBubble(country, 'Country');
            selectedFiltersContainer.appendChild(bubble);
        });
        // Display selected langues
        selectedLangues.forEach((langue) => {
            const bubble = createFilterBubble(langue, 'Langue');
            selectedFiltersContainer.appendChild(bubble);
        });
        selectedAtouts.forEach((atout) => {
            const bubble = createFilterBubble(atout, 'Atout');
            selectedFiltersContainer.appendChild(bubble);
        });
        selectedGenres.forEach((genre) => {
            const bubble = createFilterBubble(genre, 'Genre');
            selectedFiltersContainer.appendChild(bubble);
        });

        // Display age range if set
        if (selectedAgeMin || selectedAgeMax) {
            let ageText = 'Age: ';
            if (selectedAgeMin && selectedAgeMax) {
                ageText += `${selectedAgeMin} - ${selectedAgeMax}`;
            } else if (selectedAgeMin) {
                ageText += `From ${selectedAgeMin}`;
            } else if (selectedAgeMax) {
                ageText += `Up to ${selectedAgeMax}`;
            }
            const bubble = createFilterBubble(ageText, 'Age');
            selectedFiltersContainer.appendChild(bubble);
        }
    }

    // Function to create a filter bubble element
    function createFilterBubble(value, type) {
        const bubble = document.createElement('div');
        bubble.className = 'flex items-center px-3 py-1 bg-blue-950 mb-4 text-white rounded-full text-sm';

        const span = document.createElement('span');
        span.textContent = value;

        const removeButton = document.createElement('button');
        removeButton.className = 'ml-2 focus:outline-none';
        removeButton.innerHTML = '&times;';
        removeButton.addEventListener('click', () => {
            removeFilter(value, type);
        });

        bubble.appendChild(span);
        bubble.appendChild(removeButton);

        return bubble;
    }

    // Function to remove a filter
    function removeFilter(value, type) {
        if (type === 'Category') {
            selectedCategories = selectedCategories.filter(item => item !== value);
            // Deselect the button
            const button = document.querySelector(`.filter-button[data-filter="${value}"][data-filter-type="Category"]`);
            if (button) button.click();
        } else if (type === 'Type of Videos') {
            selectedVideoTypes = selectedVideoTypes.filter(item => item !== value);
            const button = document.querySelector(`.filter-button[data-filter="${value}"][data-filter-type="Type of Videos"]`);
            if (button) button.click();
        } else if (type === 'Country') {
            selectedCountries = selectedCountries.filter(item => item !== value);
            const button = document.querySelector(`.filter-button[data-filter="${value}"][data-filter-type="Country"]`);
            if (button) button.click();
        } else if (type === 'Langue') {
            selectedLangues = selectedLangues.filter(item => item !== value);
            const button = document.querySelector(`.filter-button[data-filter="${value}"][data-filter-type="Langue"]`);
            if (button) button.click();
        } else if (type === 'Atout') {
            selectedAtouts = selectedAtouts.filter(item => item !== value);
            const button = document.querySelector(`.filter-button[data-filter="${value}"][data-filter-type="Atout"]`);
            if (button) button.click();
        } else if (type === 'Genre') {
            selectedGenres = selectedGenres.filter(item => item !== value);
            const button = document.querySelector(`.filter-button[data-filter="${value}"][data-filter-type="Genre"]`);
            if (button) button.click();
        } else if (type === 'Age') {
            selectedAgeMin = '';
            selectedAgeMax = '';
            ageMinInput.value = '';
            ageMaxInput.value = '';
        }

        updateSelectedFiltersDisplay();

        // Update hidden inputs before submitting
        updateHiddenInputs();

        // Submit the form automatically to update results
        filterForm.submit();
    }

    // Function to update hidden inputs
    function updateHiddenInputs() {
        document.getElementById('selected-categories').value = selectedCategories.join(',');
        document.getElementById('selected-video-types').value = selectedVideoTypes.join(',');
        document.getElementById('selected-countries-input').value = selectedCountries.join(',');
        document.getElementById('selected-langues-input').value = selectedLangues.join(',');
        document.getElementById('selected-atouts-input').value = selectedAtouts.join(',');
        document.getElementById('selected-genres-input').value = selectedGenres.join(',');
        document.getElementById('selected-age-min').value = selectedAgeMin;
        document.getElementById('selected-age-max').value = selectedAgeMax;
    }

    // Event listener for filter buttons
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Toggle 'active' state
            button.classList.toggle('active');

            // Visual feedback for active state
            if (button.classList.contains('active')) {
                button.classList.remove('bg-white', 'text-blue-950');
                button.classList.add('bg-blue-950', 'text-white');
            } else {
                button.classList.remove('bg-blue-950', 'text-white');
                button.classList.add('bg-white', 'text-blue-950');
            }

            // Get filter value and type
            const filterValue = button.getAttribute('data-filter');
            const filterType = button.getAttribute('data-filter-type');

            // Update the appropriate selected filters array based on filter type
            if (button.classList.contains('active')) {
                if (filterType === 'Category') {
                    if (!selectedCategories.includes(filterValue)) {
                        selectedCategories.push(filterValue);
                    }
                } else if (filterType === 'Type of Videos') {
                    if (!selectedVideoTypes.includes(filterValue)) {
                        selectedVideoTypes.push(filterValue);
                    }
                } else if (filterType === 'Country') {
                    if (!selectedCountries.includes(filterValue)) {
                        selectedCountries.push(filterValue);
                    }
                } else if (filterType === 'Langue') {
                    if (!selectedLangues.includes(filterValue)) {
                        selectedLangues.push(filterValue);
                    }
                } else if (filterType === 'Atout') {
                    if (!selectedAtouts.includes(filterValue)) {
                        selectedAtouts.push(filterValue);
                    }
                } else if (filterType === 'Genre') {
                    if (!selectedGenres.includes(filterValue)) {
                        selectedGenres.push(filterValue);
                    }
                }
            } else {
                if (filterType === 'Category') {
                    selectedCategories = selectedCategories.filter(item => item !== filterValue);
                } else if (filterType === 'Type of Videos') {
                    selectedVideoTypes = selectedVideoTypes.filter(item => item !== filterValue);
                } else if (filterType === 'Country') {
                    selectedCountries = selectedCountries.filter(item => item !== filterValue);
                } else if (filterType === 'Langue') {
                    selectedLangues = selectedLangues.filter(item => item !== filterValue);
                } else if (filterType === 'Atout') {
                    selectedAtouts = selectedAtouts.filter(item => item !== filterValue);
                } else if (filterType === 'Genre') {
                    selectedGenres = selectedGenres.filter(item => item !== filterValue);
                }
            }

            updateSelectedFiltersDisplay();
            updateHiddenInputs(); // Populate hidden fields before submit
            filterForm.submit(); 
        });
    });

    // Event listeners for age inputs
    ageMinInput.addEventListener('change', () => {
        selectedAgeMin = ageMinInput.value;
        updateSelectedFiltersDisplay();
        updateHiddenInputs();
        filterForm.submit();    
    });

    ageMaxInput.addEventListener('change', () => {
        selectedAgeMax = ageMaxInput.value;
        updateSelectedFiltersDisplay();
        updateHiddenInputs();
        filterForm.submit();
        
    });

    // Before form submission, populate hidden inputs
    filterForm.addEventListener('submit', () => {
        updateHiddenInputs();
    });

    // Initialize selected filters if any (from URL parameters)
    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const queries = queryString.split('&');
        queries.forEach((query) => {
            const [key, value] = query.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        return params;
    }

    const params = getQueryParams();

    if (params.categories) {
        selectedCategories = params.categories.split(',').filter(Boolean);
    }
    if (params.videoTypes) {
        selectedVideoTypes = params.videoTypes.split(',').filter(Boolean);
    }
    if (params.countries) {
        selectedCountries = params.countries.split(',').filter(Boolean);
    }
    if (params.langues) {
        selectedLangues = params.langues.split(',').filter(Boolean);
    }
    if (params.atouts) {
        selectedAtouts = params.atouts.split(',').filter(Boolean);
    }
    if (params.genres) {
        selectedGenres = params.genres.split(',').filter(Boolean);
    }
    if (params.ageMin) {
        selectedAgeMin = params.ageMin;
        ageMinInput.value = selectedAgeMin;
    }
    if (params.ageMax) {
        selectedAgeMax = params.ageMax;
        ageMaxInput.value = selectedAgeMax;
    }

    // Update button states based on selected filters
    filterButtons.forEach((button) => {
        const filterValue = button.getAttribute('data-filter');
        const filterType = button.getAttribute('data-filter-type');

        if ((filterType === 'Category' && selectedCategories.includes(filterValue)) ||
            (filterType === 'Type of Videos' && selectedVideoTypes.includes(filterValue)) ||
            (filterType === 'Country' && selectedCountries.includes(filterValue)) || 
            (filterType === 'Langue' && selectedLangues.includes(filterValue)) ||
            (filterType === 'Genre' && selectedGenres.includes(filterValue)) ||
            (filterType === 'Atout' && selectedAtouts.includes(filterValue))) {
            button.classList.remove('active', 'bg-white', 'text-blue-950');
            button.classList.add('active', 'bg-blue-950', 'text-white');
        }
    });

    // Display selected filters on page load
    updateSelectedFiltersDisplay();
    
});
