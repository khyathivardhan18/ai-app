# Edith AI App

## Setup & Security

**Important:** This app uses an API key for Google Gemini. For security, the API key is never committed to the repository.

### 1. Local Development

1. Copy the `.env` template below into a file named `.env` in the project root:

    ```env
    VITE_API_KEY=your_actual_api_key_here
    ```

2. **Never commit your `.env` file!** It is already in `.gitignore`.

3. Install dependencies and start the app:

    ```sh
    npm install
    npm run dev
    ```

### 2. Deployment (GitHub Pages)

This project uses GitHub Actions to deploy securely:

- The API key is stored as a GitHub Secret (`VITE_API_KEY`).
- The workflow injects the secret at build time.
- The key is never exposed in the repository or build artifacts.

#### To deploy:
1. Go to your repository's **Settings → Secrets and variables → Actions**
2. Add a new secret:
    - **Name:** `VITE_API_KEY`
    - **Value:** your actual API key
3. Push to the `main` branch. The workflow will build and deploy automatically.

### 3. Security Notes
- **Never share or commit your API key.**
- **Rotate your API key** if you believe it has been exposed.
- **Collaborators** should set up their own `.env` file locally.

---

## Project Scripts
- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

---

For more details, see the workflow file in `.github/workflows/deploy.yml`.
