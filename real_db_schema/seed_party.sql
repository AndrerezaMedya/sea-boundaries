-- Membuat tabel party
CREATE TABLE IF NOT EXISTS party (
    pID VARCHAR(50) PRIMARY KEY,
    partyName VARCHAR(255) NOT NULL,
    partyRole VARCHAR(255) NOT NULL,
    partyType VARCHAR(255) NOT NULL
);

-- Memasukkan data party
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('AUS', 'Australia', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('PNG', 'Papua Nugini', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('IDN', 'Indonesia', 'rightsHolder', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('IND', 'India', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('MYS', 'Malaysia', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('PHL', 'Philippines', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('PLW', 'Palau', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('SGP', 'Singapore', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('THA', 'Thailand', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('TLS', 'Timor Leste', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
INSERT INTO party (pID, partyName, partyRole, partyType) VALUES ('VNM', 'Vietnam', 'adjacentState', 'stateCountry') ON CONFLICT (pID) DO NOTHING;
