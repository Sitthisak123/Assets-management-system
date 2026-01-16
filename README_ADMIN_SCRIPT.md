To create an admin account, you need to:
1.  Create a new user in Supabase Authentication.
2.  Update that user's corresponding record in the `profiles` table to set their `role` to `1`.

I have created a script that automates this process for you.

### How to use the script:

1.  **Find and Add Service Key**: 
    *   Navigate to your Supabase Project's API settings: `https://supabase.com/dashboard/project/_/settings/api`.
    *   Find the key labeled `service_role` under the "Project API keys" section. **This is a secret key and should be handled securely.**
    *   Copy this key and add it to your `.env` file as `SUPABASE_SERVICE_KEY`.
    ```
    SUPABASE_SERVICE_KEY="your_actual_service_role_key"
    ```
2.  **Open the script file**: `scripts/create-admin.js`
3.  **Edit the `adminUser` object**: Change the `email` and `password` to your desired credentials.
4.  **Run the script from your terminal**:
    ```bash
    node scripts/create-admin.js
    ```
5.  **Check the output**: The script will log the outcome of each step. If successful, your admin user will be created.

**Important**: After creating the admin user, it is highly recommended to delete or secure the `scripts/create-admin.js` file to prevent accidental or malicious use, as it contains sensitive credentials.
