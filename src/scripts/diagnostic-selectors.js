const fs = require('fs');
const cheerio = require('cheerio');

function testSelectors(filePath, type) {
    console.log(`\nTesting ${type} selectors for: ${filePath}`);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    if (type === 'product') {
        const title = $('#productTitle').text().trim() || $('#title').text().trim() || $('h1 span').first().text().trim();
        const priceWhole = $('.a-price .a-price-whole').first().text().trim();
        const priceFraction = $('.a-price .a-price-fraction').first().text().trim();
        const priceOffscreen = $('.a-price .a-offscreen').first().text().trim();
        const accessibilityPrice = $('#apex-pricetopay-accessibility-label').text().trim();

        console.log('Title:', title);
        console.log('Price (Whole):', priceWhole);
        console.log('Price (Fraction):', priceFraction);
        console.log('Price (Offscreen):', priceOffscreen);
        console.log('Price (Accessibility):', accessibilityPrice);
    } else {
        const results = $('.s-result-item[data-component-type="s-search-result"], .s-result-item.s-asin');
        console.log('Found results:', results.length);

        results.slice(0, 3).each((i, el) => {
            const $el = $(el);
            const asin = $el.attr('data-asin');
            const title = $el.find('h2').text().trim() || $el.find('.a-text-normal').first().text().trim();
            const price = $el.find('.a-price .a-offscreen').first().text().trim();
            console.log(`Result ${i + 1} [ASIN: ${asin}]:`);
            console.log('  Title:', title);
            console.log('  Price:', price);
        });
    }
}

try {
    testSelectors('c:/Users/Gorska/Desktop/Chat Bot Promo/data/logs/debug/amazon_product_debug.html', 'product');
} catch (e) {
    console.error('Error testing product:', e.message);
}

try {
    testSelectors('c:/Users/Gorska/Desktop/Chat Bot Promo/data/logs/debug/amazon_search_debug.html', 'search');
} catch (e) {
    console.error('Error testing search:', e.message);
}
