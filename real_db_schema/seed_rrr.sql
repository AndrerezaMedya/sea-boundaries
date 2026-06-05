-- Membuat tabel Right
-- Catatan: "right" menggunakan tanda kutip ganda karena 'right' adalah reserved keyword di PostgreSQL
CREATE TABLE IF NOT EXISTS "right" (
    rrrID VARCHAR(50) PRIMARY KEY,
    rightType VARCHAR(255) NOT NULL,
    rightRestrictionResponsibilityDescription TEXT,
    rightRestrictionResponsibilityShare NUMERIC,
    rightRestrictionResponsibilityShareCheck BOOLEAN,
    pID VARCHAR(50)
);

-- Membuat tabel Responsibility
CREATE TABLE IF NOT EXISTS responsibility (
    rrrID VARCHAR(50) PRIMARY KEY,
    responsibilityType VARCHAR(255) NOT NULL,
    rightRestrictionResponsibilityDescription TEXT,
    rightRestrictionResponsibilityShare NUMERIC,
    rightRestrictionResponsibilityShareCheck BOOLEAN,
    pID VARCHAR(50)
);

-- Membuat tabel Restriction
CREATE TABLE IF NOT EXISTS restriction (
    rrrID VARCHAR(50) PRIMARY KEY,
    restrictionType VARCHAR(255) NOT NULL,
    partyRequired BOOLEAN,
    rightRestrictionResponsibilityDescription TEXT,
    rightRestrictionResponsibilityShare NUMERIC,
    rightRestrictionResponsibilityShareCheck BOOLEAN,
    pID VARCHAR(50)
);

-- Memasukkan data Right
INSERT INTO "right" (rrrID, rightType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RIGHT-001', 'sovereignty', 'Full sovereignty of Indonesia, including the airspace above it as well as the seabed and subsoil beneath it, in accordance with the United Nations Convention on the Law of the Sea, which was ratified through Law Number 17 of 1985', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO "right" (rrrID, rightType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RIGHT-002', 'sovereignRight', 'Indonesia''s sovereign rights to explore, exploit, conserve, and manage natural resources within the Exclusive Economic Zone, as well as on the seabed and subsoil of the continental shelf, without full sovereignty over the waters themselves.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO "right" (rrrID, rightType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RIGHT-003', 'contiguousRight', 'Indonesia''s right to exercise control within the contiguous zone in order to prevent and punish violations of customs, fiscal, immigration, and sanitary laws and regulations.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO "right" (rrrID, rightType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RIGHT-004', 'harvestRight', 'Rights related to the utilization of marine living resources/fisheries, with due regard to conservation and optimum utilization. Their regulation and implementation are subject to agreements or cooperative arrangements with other States.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;

-- Memasukkan data Responsibility
INSERT INTO responsibility (rrrID, responsibilityType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESPONSIBILITY-001', 'respectExistingAgreement', 'Respect for international agreements that are already in force with other States, including the implementation of provisions agreed upon within the framework of international law.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO responsibility (rrrID, responsibilityType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESPONSIBILITY-002', 'existingSubMarineCables', 'Respect for submarine cables installed by other States without making landfall, including the authorization for their maintenance and replacement after prior notification.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO responsibility (rrrID, responsibilityType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESPONSIBILITY-003', 'innocentPassage', 'Granting the right of innocent passage for foreign ships and aircraft within areas of sovereignty and jurisdiction, provided that such passage does not disturb sovereignty, security, and public order.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO responsibility (rrrID, responsibilityType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESPONSIBILITY-004', 'MarineLivingResourcesManagement', 'Sustainable management of marine living resources, including the regulation of fisheries utilization, protection of marine ecosystems, and conservation of marine biodiversity.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO responsibility (rrrID, responsibilityType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESPONSIBILITY-005', 'MarineNonLivingResourcesManagement', 'Proper and responsible management of marine non-living resources, such as oil, natural gas, and seabed minerals, in accordance with national and international law.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO responsibility (rrrID, responsibilityType, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESPONSIBILITY-006', 'archipelagicSeaLanesPassage', 'Granting the right of archipelagic sea lanes passage for foreign ships and aircraft in a continuous, direct, and expeditious manner through designated sea lanes.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;

-- Memasukkan data Restriction
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-001', 'territorialSeaMax12NM', TRUE, 'The breadth of the Territorial Sea shall not exceed 12 nautical miles from the baseline.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-002', 'eezMax200NM', TRUE, 'The breadth of the Exclusive Economic Zone shall not exceed 200 nautical miles from the baseline.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-003', 'continentalShelfMax200NM', TRUE, 'The Continental Shelf shall extend up to a maximum of 200 nautical miles from the baseline.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-004', 'maximumExtent24NM', TRUE, 'The breadth of the Contiguous Zone shall not exceed 24 nautical miles from the baseline.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-005', 'continentalShelfMax', TRUE, 'The outer limits of the continental shelf shall not exceed 350 nautical miles from the baseline and shall not exceed 100 nautical miles from the 2,500-meter isobath.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-006', 'internalWaterResc', TRUE, 'All waters located on the landward side of the baseline, such as ports, rivers, lakes, canals, and navigable waters.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-007', 'archipelagicWaterResc', TRUE, 'Waters enclosed by archipelagic baselines (with a maximum length of 100 nautical miles) connecting the outermost islands of an archipelagic State (Ratio between Water and Land is 9:1)', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-008', 'archipelagicSeaLanesPassResc', TRUE, 'The width of the Indonesian Archipelagic Sea Lanes (IASL/ALKI) generally extends 25 nautical miles to the right and 25 nautical miles to the left of the axis line, resulting in a total width of approximately 50 nautical miles. (Based on IMO provisions and UNCLOS 1982 implementation)', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-009', 'authorizedAccess', TRUE, 'Fishing vessels shall not fish in areas subject to the enforcement jurisdiction of the other Party unless authorized under applicable agreements, arrangements, or laws.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-010', 'licenseCompliance', TRUE, 'Fishing vessels authorized to operate in areas subject to the enforcement jurisdiction of the other Party shall comply with the applicable laws, licence terms, and conditions of that Party.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
INSERT INTO restriction (rrrID, restrictionType, partyRequired, rightRestrictionResponsibilityDescription, rightRestrictionResponsibilityShare, rightRestrictionResponsibilityShareCheck, pID) VALUES 
('RESTRICTION-011', 'accessTermsAndConditions', TRUE, 'Access to fisheries resources under the jurisdiction of another Party shall be subject to agreed terms and conditions, including vessel position recording, catch and effort reporting, licence requirements, observers, and access fees.', 1, TRUE, 'IDN') ON CONFLICT (rrrID) DO NOTHING;
