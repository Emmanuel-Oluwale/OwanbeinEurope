# Environment Variables

Add these in Vercel Project Settings, under Environment Variables.

Public Supabase values:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ORDER_PREFIX

Private payment account values. Do not prefix these with NEXT_PUBLIC.

- PAYMENT_ACCOUNT_1_IBAN
- PAYMENT_ACCOUNT_1_NAME
- PAYMENT_ACCOUNT_2_IBAN
- PAYMENT_ACCOUNT_2_NAME
- PAYMENT_ACCOUNT_3_IBAN
- PAYMENT_ACCOUNT_3_NAME
- PAYMENT_ACCOUNT_4_IBAN
- PAYMENT_ACCOUNT_4_NAME

Optional analytics values:

- NEXT_PUBLIC_GA_ID
- NEXT_PUBLIC_META_PIXEL_ID

Security rule:

Full bank account details stay only in Vercel environment variables. Supabase stores only payment_account_label such as account_1, account_2, account_3, or account_4.
