-- API-compatible flat projection (JOIN source + SOR + REF).
-- Prasyarat: seed_source_normalized.sql (atau migrate_source_normalize.sql).
-- Generated to match patches/migrate_source_normalize.sql section 5.

CREATE OR REPLACE VIEW source_flat AS
SELECT
  s.sid,
  s.sourcedocumentname,
  s.sourceregistrynumber,
  s.sourceadministrativedatestamp,
  s.sourceauthoritativedate,
  s.sourcedocumenttype,
  s.sourceavailabilitystatus,
  s.administrativesourcetype,
  s.spatialsourcetype,
  s.sourcetype,
  s.sourcerecordation,
  s.sourceonlineresourceid,
  s.sourcereferenceid,
  sor.sourceonlineresourcelinkageurl,
  sor.sourceonlineresourceprotocol,
  sor.sourceonlineresourceapplicationprofile,
  sor.sourceonlineresourcename,
  sor.sourceonlineresourcedescription,
  sor.sourceonlineresourcefunction,
  ref.responsiblepartyoganizationname,
  ref.responsiblepartypositionname,
  ref.responsiblepartyrole,
  ref.responsiblepartycontactonline,
  ref.responsiblepartycontactphone,
  ref.responsiblepartycontactaddresscountry,
  ref.responsiblepartycontactaddressdeliverypoint,
  ref.responsiblepartycontactaddresscity,
  ref.responsiblepartycontactelectronicmailaddress,
  ref.responsiblepartycontactaddressadministrativearea,
  ref.responsiblepartycontactaddresspostalcode
FROM source s
JOIN source_online_resource sor
  ON s.sourceonlineresourceid = sor.sourceonlineresourceid
JOIN source_reference ref
  ON s.sourcereferenceid = ref.sourcereferenceid;
