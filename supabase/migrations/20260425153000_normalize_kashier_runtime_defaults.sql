-- Align persisted Kashier settings with runtime behavior and UI parsing.

update public.settings
set kashier_currency = 'EGP'
where coalesce(nullif(trim(kashier_currency), ''), 'EGP') <> 'EGP';

update public.settings
set kashier_hpp_base_url = 'https://checkout.kashier.io/'
where coalesce(
  nullif(trim(kashier_hpp_base_url), ''),
  'https://checkout.kashier.io/'
) <> 'https://checkout.kashier.io/';

update public.settings
set kashier_allowed_methods = nullif(
  regexp_replace(lower(kashier_allowed_methods), '\\s+', '', 'g'),
  ''
)
where kashier_allowed_methods is not null;