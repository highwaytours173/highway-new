alter table public.settings
add column if not exists og_image_url text null,
add column if not exists twitter_image_url text null;

update public.settings
set og_image_url = nullif(trim(data #>> '{seo,site,ogImageUrl}'), '')
where og_image_url is null
  and nullif(trim(data #>> '{seo,site,ogImageUrl}'), '') is not null;

update public.settings
set twitter_image_url = nullif(trim(data #>> '{seo,site,twitterImageUrl}'), '')
where twitter_image_url is null
  and nullif(trim(data #>> '{seo,site,twitterImageUrl}'), '') is not null;
