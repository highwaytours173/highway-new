alter table public.settings
add column if not exists kashier_merchant_id text null,
add column if not exists kashier_secret_key text null,
add column if not exists kashier_api_key text null,
add column if not exists kashier_mode text null,
add column if not exists kashier_currency text null,
add column if not exists kashier_merchant_redirect_url text null,
add column if not exists kashier_hpp_base_url text null,
add column if not exists kashier_allowed_methods text null,
add column if not exists kashier_display text null;

update public.settings
set kashier_merchant_id = coalesce(
  nullif(trim(data #>> '{kashierSettings,merchantId}'), ''),
  nullif(trim(data #>> '{kashier_settings,merchant_id}'), ''),
  nullif(trim(data #>> '{kashier,merchantId}'), ''),
  nullif(trim(data #>> '{kashier,merchant_id}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,merchantId}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,merchant_id}'), '')
)
where kashier_merchant_id is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,merchantId}'), ''),
    nullif(trim(data #>> '{kashier_settings,merchant_id}'), ''),
    nullif(trim(data #>> '{kashier,merchantId}'), ''),
    nullif(trim(data #>> '{kashier,merchant_id}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,merchantId}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,merchant_id}'), '')
  ) is not null;

update public.settings
set kashier_secret_key = coalesce(
  nullif(trim(data #>> '{kashierSettings,secretKey}'), ''),
  nullif(trim(data #>> '{kashier_settings,secret_key}'), ''),
  nullif(trim(data #>> '{kashier,secretKey}'), ''),
  nullif(trim(data #>> '{kashier,secret_key}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,secretKey}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,secret_key}'), '')
)
where kashier_secret_key is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,secretKey}'), ''),
    nullif(trim(data #>> '{kashier_settings,secret_key}'), ''),
    nullif(trim(data #>> '{kashier,secretKey}'), ''),
    nullif(trim(data #>> '{kashier,secret_key}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,secretKey}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,secret_key}'), '')
  ) is not null;

update public.settings
set kashier_api_key = coalesce(
  nullif(trim(data #>> '{kashierSettings,apiKey}'), ''),
  nullif(trim(data #>> '{kashier_settings,api_key}'), ''),
  nullif(trim(data #>> '{kashier,apiKey}'), ''),
  nullif(trim(data #>> '{kashier,api_key}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,apiKey}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,api_key}'), '')
)
where kashier_api_key is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,apiKey}'), ''),
    nullif(trim(data #>> '{kashier_settings,api_key}'), ''),
    nullif(trim(data #>> '{kashier,apiKey}'), ''),
    nullif(trim(data #>> '{kashier,api_key}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,apiKey}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,api_key}'), '')
  ) is not null;

update public.settings
set kashier_mode = lower(
  coalesce(
    nullif(trim(data #>> '{kashierSettings,mode}'), ''),
    nullif(trim(data #>> '{kashier_settings,mode}'), ''),
    nullif(trim(data #>> '{kashier,mode}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,mode}'), '')
  )
)
where kashier_mode is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,mode}'), ''),
    nullif(trim(data #>> '{kashier_settings,mode}'), ''),
    nullif(trim(data #>> '{kashier,mode}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,mode}'), '')
  ) is not null;

update public.settings
set kashier_currency = coalesce(
  nullif(trim(data #>> '{kashierSettings,currency}'), ''),
  nullif(trim(data #>> '{kashier_settings,currency}'), ''),
  nullif(trim(data #>> '{kashier,currency}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,currency}'), '')
)
where kashier_currency is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,currency}'), ''),
    nullif(trim(data #>> '{kashier_settings,currency}'), ''),
    nullif(trim(data #>> '{kashier,currency}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,currency}'), '')
  ) is not null;

update public.settings
set kashier_merchant_redirect_url = coalesce(
  nullif(trim(data #>> '{kashierSettings,merchantRedirectUrl}'), ''),
  nullif(trim(data #>> '{kashier_settings,merchant_redirect_url}'), ''),
  nullif(trim(data #>> '{kashier,merchantRedirectUrl}'), ''),
  nullif(trim(data #>> '{kashier,merchant_redirect_url}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,merchantRedirectUrl}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,merchant_redirect_url}'), '')
)
where kashier_merchant_redirect_url is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,merchantRedirectUrl}'), ''),
    nullif(trim(data #>> '{kashier_settings,merchant_redirect_url}'), ''),
    nullif(trim(data #>> '{kashier,merchantRedirectUrl}'), ''),
    nullif(trim(data #>> '{kashier,merchant_redirect_url}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,merchantRedirectUrl}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,merchant_redirect_url}'), '')
  ) is not null;

update public.settings
set kashier_hpp_base_url = coalesce(
  nullif(trim(data #>> '{kashierSettings,hppBaseUrl}'), ''),
  nullif(trim(data #>> '{kashier_settings,hpp_base_url}'), ''),
  nullif(trim(data #>> '{kashier,hppBaseUrl}'), ''),
  nullif(trim(data #>> '{kashier,hpp_base_url}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,hppBaseUrl}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,hpp_base_url}'), '')
)
where kashier_hpp_base_url is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,hppBaseUrl}'), ''),
    nullif(trim(data #>> '{kashier_settings,hpp_base_url}'), ''),
    nullif(trim(data #>> '{kashier,hppBaseUrl}'), ''),
    nullif(trim(data #>> '{kashier,hpp_base_url}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,hppBaseUrl}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,hpp_base_url}'), '')
  ) is not null;

update public.settings
set kashier_allowed_methods = coalesce(
  nullif(trim(data #>> '{kashierSettings,allowedMethods}'), ''),
  nullif(trim(data #>> '{kashier_settings,allowed_methods}'), ''),
  nullif(trim(data #>> '{kashier,allowedMethods}'), ''),
  nullif(trim(data #>> '{kashier,allowed_methods}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,allowedMethods}'), ''),
  nullif(trim(data #>> '{paymentMethods,kashier,allowed_methods}'), '')
)
where kashier_allowed_methods is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,allowedMethods}'), ''),
    nullif(trim(data #>> '{kashier_settings,allowed_methods}'), ''),
    nullif(trim(data #>> '{kashier,allowedMethods}'), ''),
    nullif(trim(data #>> '{kashier,allowed_methods}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,allowedMethods}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,allowed_methods}'), '')
  ) is not null;

update public.settings
set kashier_display = lower(
  coalesce(
    nullif(trim(data #>> '{kashierSettings,display}'), ''),
    nullif(trim(data #>> '{kashier_settings,display}'), ''),
    nullif(trim(data #>> '{kashier,display}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,display}'), '')
  )
)
where kashier_display is null
  and coalesce(
    nullif(trim(data #>> '{kashierSettings,display}'), ''),
    nullif(trim(data #>> '{kashier_settings,display}'), ''),
    nullif(trim(data #>> '{kashier,display}'), ''),
    nullif(trim(data #>> '{paymentMethods,kashier,display}'), '')
  ) is not null;