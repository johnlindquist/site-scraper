# Site Scraper

A web application that scrapes content from URLs and presents it in a clean, readable format. Built with Node.js, TypeScript, Express, and Cheerio.

## Features

- Simple and clean user interface
- URL validation
- Content extraction from any web page
- Clean reading format with proper typography
- Responsive design
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- pnpm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd site-scraper
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

To run the application in development mode with hot-reloading:

```bash
pnpm dev
```

The server will start at `http://localhost:3000`.

## Production

To build and run the application in production:

```bash
pnpm build
pnpm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a URL in the input field
3. Click "Scrape" to fetch and display the content
4. The content will be displayed in a clean, readable format

## Error Handling

The application includes error handling for:
- Invalid URLs
- Failed requests
- Parsing errors
- Server errors

## License

ISC 