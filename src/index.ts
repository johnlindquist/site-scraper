import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3000;

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// GET route for the home page with the form
app.get('/', (_req: Request, res: Response): void => {
  const formHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Page Scraper</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="container">
          <h1>Enter a URL to Scrape</h1>
          <form action="/scrape" method="POST" class="scrape-form">
            <input 
              type="url" 
              name="url" 
              placeholder="https://example.com" 
              required 
              class="url-input"
            />
            <button type="submit" class="submit-button">Scrape</button>
          </form>
        </div>
      </body>
    </html>
  `;
  res.send(formHTML);
});

// POST route to handle the form submission
app.post('/scrape', async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p class="error">Please provide a valid URL.</p>
            <a href="/" class="back-link">⬅ Try again</a>
          </div>
        </body>
      </html>
    `);
    return;
  }

  try {
    // Fetch the page content with a timeout
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    
    if (!html) {
      throw new Error('No HTML content received');
    }

    // Use cheerio to parse the HTML
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, iframe, nav, footer, header, aside').remove();

    // Extract main content
    const title = $('title').text().trim() || 'Untitled Page';
    
    // Try to find the main content container
    const mainSelectors = ['article', 'main', '.content', '.post', '#content', '.article', '.post-content'];
    let content = '';
    
    for (const selector of mainSelectors) {
      const container = $(selector).first();
      if (container.length) {
        content = container
          .find('p, h1, h2, h3, h4, h5, h6')
          .map((_, el) => {
            const $el = $(el);
            const tagName = $el.prop('tagName')?.toLowerCase();
            if (!tagName) return '';
            const text = $el.text().trim();
            return text ? `<${tagName}>${text}</${tagName}>` : '';
          })
          .get()
          .filter(text => text.length > 0)
          .join('\n');
        
        if (content) break;
      }
    }

    // Fallback to all paragraphs if no content found
    if (!content) {
      content = $('p')
        .map((_, el) => {
          const text = $(el).text().trim();
          return text ? `<p>${text}</p>` : '';
        })
        .get()
        .filter(text => text.length > 0)
        .join('\n');
    }

    if (!content) {
      throw new Error('No content found on the page');
    }

    // Build the response HTML
    const scrapedHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Scraped: ${title}</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <div class="container">
            <h1>${title}</h1>
            <div class="content">
              ${content}
            </div>
            <a href="/" class="back-link">⬅ Scrape another page</a>
          </div>
        </body>
      </html>
    `;

    res.send(scrapedHTML);
  } catch (error) {
    console.error('Scraping error:', error);
    
    let errorMessage = 'Failed to scrape the page. Please check the URL and try again.';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The page took too long to respond.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Page not found. Please check if the URL is correct.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. The website does not allow scraping.';
      }
    }

    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p class="error">${errorMessage}</p>
            <a href="/" class="back-link">⬅ Try again</a>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
}); 