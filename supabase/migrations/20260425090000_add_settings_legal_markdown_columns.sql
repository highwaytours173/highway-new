alter table public.settings
add column if not exists terms_and_condition_markdown text null,
add column if not exists policy_security_markdown text null;

update public.settings
set terms_and_condition_markdown = data #>> '{legalPages,termsAndConditionMarkdown}'
where terms_and_condition_markdown is null
  and nullif(trim(data #>> '{legalPages,termsAndConditionMarkdown}'), '') is not null;

update public.settings
set policy_security_markdown = data #>> '{legalPages,policySecurityMarkdown}'
where policy_security_markdown is null
  and nullif(trim(data #>> '{legalPages,policySecurityMarkdown}'), '') is not null;
