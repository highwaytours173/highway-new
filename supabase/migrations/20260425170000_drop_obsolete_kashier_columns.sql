alter table public.settings
  drop column if exists kashier_secret_key,
  drop column if exists kashier_currency,
  drop column if exists kashier_merchant_redirect_url,
  drop column if exists kashier_hpp_base_url;
