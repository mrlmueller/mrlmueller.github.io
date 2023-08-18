document.addEventListener('DOMContentLoaded', () => {
    fetchPredictionData();
});

function fetchPredictionData() {
    const url = 'https://weather-predict-c082b7cff7dc.herokuapp.com/latest_prediction';
    const headers = {
        'X-Secret-Key': 'WADwda79342!124!'
    };

    fetch(url, { method: 'GET', headers: headers })
    .then(response => response.json())
    .then(data => {
        const temperatures = data.predictions.map(item => item.temperature);
        const timeStamps = data.predictions.map(item => item.timestamp);
        
        populateSlider(timeStamps, temperatures); // Add this line
        createGraph(timeStamps, temperatures); // Add this line
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function setupCardSelection() {
    const cards = document.querySelectorAll('.top_bottom_wrapper .card');
    const temperatureHeading = document.querySelector('h2');

    cards.forEach(card => {
        card.addEventListener('click', function() {
            // First, remove the 'selected' class from all cards
            cards.forEach(c => c.classList.remove('selected'));
            
            // Add 'selected' class to the clicked card
            this.classList.add('selected');

            // Extract the temperature from the selected card
            const cardTemperature = this.querySelector('h5').textContent;

            // Update the h1 heading with the selected card's temperature
            temperatureHeading.textContent = cardTemperature;
        });
    });
}


function populateSlider(timeStamps, temperatures) {
    const sliderWrapper = document.querySelector('.top_bottom_wrapper.slider');
    const temperatureHeading = document.querySelector('h2');

    for (let i = 2; i < timeStamps.length; i++) {
        const card = document.createElement('div');
        card.className = 'card';

        // For the first card, add the 'selected' class
        if (i === 2) {
            card.classList.add('selected');
        }

        const h3 = document.createElement('h3');
        h3.textContent = new Date(timeStamps[i]).getHours() + ":00";
        
        const h5 = document.createElement('h5');
        h5.textContent = Math.round(temperatures[i]) + "°";

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image_wrapper card_image';

        card.appendChild(h3);
        card.appendChild(h5);
        card.appendChild(imageWrapper);
        sliderWrapper.appendChild(card);
    }

    // Set the h1 heading to the temperature of the first card by default
    const firstCardTemperature = sliderWrapper.querySelector('.selected h5').textContent;
    temperatureHeading.textContent = firstCardTemperature;

    // Call the setupCardSelection function here after populating the cards
    setupCardSelection();
}

function pxToEm(px, base = 16) {
    return px / base + 'em';
}

function createGraph(timeStamps, temperatures) {
    const margin = {top: parseFloat(pxToEm(200)), right: parseFloat(pxToEm(150)), bottom: parseFloat(pxToEm(200)), left: parseFloat(pxToEm(150))};
    const container = document.querySelector('.contain_graph');
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
        .domain(d3.extent(timeStamps, d => new Date(d)))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([Math.min(...temperatures), Math.max(...temperatures)])
        .range([height, 0]);

    const svg = d3.select('.contain_graph')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const line = d3.line()
        .x((d, i) => xScale(new Date(timeStamps[i])))
        .y(d => yScale(d));

    svg.append('path')
        .datum(temperatures)
        .attr('fill', 'none')
        .attr('stroke', '#4A90E2')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    const tooltip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('background-color', '#f9f9f9')
        .style('border', pxToEm(3.36) + ' solid #e2e2e2')
        .style('border-radius', pxToEm(33.28))
        .style('padding', pxToEm(5))
        .style('opacity', 0)
        .style('width', '12em')
        .style('height', '3.69em')
        .style('flex-direction', 'column')
        .style('align-items', 'center')
        .style('padding-top', pxToEm(20))
        .style('display', 'flex');

    svg.selectAll('circle')
        .data(temperatures)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => xScale(new Date(timeStamps[i])))
        .attr('cy', d => yScale(d))
        .attr('r', parseFloat(pxToEm(160)))
        .attr('fill', '#F2C512')
        .on('mouseover', function(event, d, i) {
            
            const hour = new Date(timeStamps[i]).getHours();
            const time = `${hour}:00`; 
            const date = new Date(timeStamps[i]);
           
            tooltip.transition()
                .duration(200)
                .style('opacity', 1);
            tooltip.html(`<h6>${Math.round(d)}° </h6>`)
                .style('left', (event.pageX + parseFloat(pxToEm(10))) + 'px')
                .style('top', (event.pageY - parseFloat(pxToEm(30))) + 'px');
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
}

